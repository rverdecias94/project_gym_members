/* eslint-disable react/prop-types */
import { Divider, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect, useState } from "react";

export default function PremiumDashboard({
  membersList,
  gymInfo,
}) {
  const theme = useTheme();
  const [ageRanges, setAgeRanges] = useState({});
  const [avgStay, setAvgStay] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [lastMonthIncome, setLastMonthIncome] = useState(0);
  const [weeklyPayers, setWeeklyPayers] = useState(0);
  const [paymentsByMonth, setPaymentsByMonth] = useState(Array(12).fill(0));
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [dayLabels, setDayLabels] = useState([]);

  useEffect(() => {
    if (membersList?.length > 0 && gymInfo) {
      const today = new Date();

      // ---- Distribución de edad por CI ----
      let ranges = { "<20": 0, "20-29": 0, "30-39": 0, "40+": 0 };
      membersList.forEach((m) => {
        if (m.ci && m.ci.length >= 6) {
          let year = parseInt(m.ci.substring(0, 2), 10);
          let month = parseInt(m.ci.substring(2, 4), 10) - 1;
          let day = parseInt(m.ci.substring(4, 6), 10);
          year = year < 25 ? 2000 + year : 1900 + year;
          const birthDate = new Date(year, month, day);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 20) ranges["<20"]++;
          else if (age < 30) ranges["20-29"]++;
          else if (age < 40) ranges["30-39"]++;
          else ranges["40+"]++;
        }
      });
      setAgeRanges(ranges);

      // ---- Promedio de permanencia (meses) ----
      let totalMonths = 0;
      membersList.forEach((m) => {
        const createdAt = new Date(m.created_at);
        const diff = (today - createdAt) / (1000 * 60 * 60 * 24 * 30);
        totalMonths += diff;
      });
      setAvgStay((totalMonths / membersList.length).toFixed(1));

      // ---- Ingresos proyectados ----
      let activeMembers = membersList.filter((m) => m.active).length;
      let baseIncome = activeMembers * (gymInfo?.monthly_payment || 0);
      let trainerExtra =
        membersList.filter((m) => m.has_trainer).length *
        (gymInfo?.trainers_cost || 0);
      const currentIncome = baseIncome + trainerExtra;
      setMonthlyIncome(currentIncome);

      // ---- Ingresos mes anterior ----
      const lastMonth = today.getMonth() - 1;
      const lastMonthYear =
        lastMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const lastMonthIndex = lastMonth < 0 ? 11 : lastMonth;
      let lastMonthMembers = membersList.filter((m) => {
        if (!m.pay_date) return false;
        const payDate = new Date(m.pay_date);
        return (
          payDate.getMonth() === lastMonthIndex &&
          payDate.getFullYear() === lastMonthYear
        );
      }).length;
      setLastMonthIncome(lastMonthMembers * (gymInfo?.monthly_payment || 0));

      // ---- Clientes que pagan esta semana ----
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const payers = membersList.filter((m) => {
        if (!m.pay_date) return false;
        const payDate = new Date(m.pay_date);
        return payDate >= startOfWeek && payDate <= endOfWeek;
      }).length;
      setWeeklyPayers(payers);

      // ---- Pagos por mes (LineChart) ----
      const payments = Array(12).fill(0);
      membersList.forEach((m) => {
        if (m.pay_date) {
          const d = new Date(m.pay_date);
          payments[d.getMonth()] += 1;
        }
      });
      setPaymentsByMonth(payments);

      // ---- NUEVO: Clientes registrados en los últimos 7 días ----
      const last7Days = [];
      const labels = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(date);

        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
        const dayNumber = date.getDate();
        labels.push(`${dayName} ${dayNumber}`);
      }

      setDayLabels(labels);

      // Contar registros por día en los últimos 7 días
      const registrationsByDay = Array(7).fill(0);

      membersList.forEach(member => {
        if (member.created_at) {
          const memberDate = new Date(member.created_at);

          last7Days.forEach((day, index) => {
            const dayStart = new Date(day);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59, 999);

            if (memberDate >= dayStart && memberDate <= dayEnd) {
              registrationsByDay[index]++;
            }
          });
        }
      });

      setLast7DaysData(registrationsByDay);
    }
  }, [membersList, gymInfo]);

  return (
    <div style={{ marginTop: "3rem", padding: "1rem" }}>
      <Divider />
      <h2 style={{ margin: "1rem" }}>📊 Estadísticas Premium</h2>

      <div
        className="stats-grid"
      >
        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <BarChart
            sx={{
              "& .MuiBarElement-root:nth-of-type(odd)": {
                fill:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.main
                    : theme.palette.primary.main,
              },
              "& .MuiBarElement-root:nth-of-type(even)": {
                fill:
                  theme.palette.mode === "dark"
                    ? theme.palette.secondary.main
                    : theme.palette.primary.accent,
              },
            }}
            xAxis={[
              {
                scaleType: "band",
                data: dayLabels,
                categoryGapRatio: 0.5,
                barGapRatio: 1,
              },
            ]}
            series={[{ data: last7DaysData }]}
            height={250}
            slotProps={{
              bar: { clipPath: `inset(0px round 3px 3px 0px 0px)` },
            }}
          />
          <span>Nuevos Clientes - Últimos 7 Días</span>
        </div>

        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <BarChart
            xAxis={[{ scaleType: "band", data: Object.keys(ageRanges) }]}
            series={[{ data: Object.values(ageRanges) }]}
            height={250}
          />
          <span>Distribución de clientes por rango de edad</span>
        </div>

        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: avgStay, label: "Meses promedio" },
                  { id: 1, value: 12, label: "Referencia (12 meses)" },
                ],
                innerRadius: 30,
                outerRadius: 90,
              },
            ]}
            height={250}
          />
          <span>Permanencia promedio de clientes</span>
        </div>

        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <BarChart
            xAxis={[{ scaleType: "band", data: ["Mes anterior", "Mes actual"] }]}
            series={[{ data: [lastMonthIncome, monthlyIncome] }]}
            height={250}
          />
          <span>Ingresos proyectados ({gymInfo?.monthly_currency || "CUP"})</span>
        </div>

        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: weeklyPayers, label: "Con pago" },
                  { id: 1, value: membersList.length - weeklyPayers, label: "Sin pago" },
                ],
                innerRadius: 30,
                outerRadius: 90,
              },
            ]}
            height={250}
          />
          <span>Clientes con pago en la semana actual</span>
        </div>

        <div className={theme.palette.mode === "dark" ? "chart-box-dark" : "chart-box-light"}>
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: [
                  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                ],
              },
            ]}
            series={[{ data: paymentsByMonth, label: "Pagos" }]}
            height={300}
          />
          <span>Tendencia de pagos mensuales</span>
        </div>
      </div>

      <style>
        {`
      .stats-grid{
      display: grid;
      grid-template-columns: 1fr; /* por defecto: 1 columna (móvil) */
      gap: 1rem;
    }

    @media (min-width: 600px){ /* en pantallas >= 600px ponemos 2 columnas */
      .stats-grid{
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* estilos de las cajas para separarlas mejor */
    .chart-box-light, .chart-box-dark {
      padding: 0.8rem;
      border-radius: 8px;
      min-height: 120px;
    }
    `}
      </style>
    </div>

  );
}
