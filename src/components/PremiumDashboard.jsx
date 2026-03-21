/* eslint-disable react/prop-types */
import { Divider, useTheme } from "@mui/material";
import ReactApexChart from 'react-apexcharts';
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

  const getChartOptions = (categories, isPie = false, customColors = null, isLine = false) => {
    const baseOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Montserrat, sans-serif',
      },
      colors: customColors || [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.accent],
      theme: {
        mode: theme.palette.mode,
      },
      tooltip: {
        theme: theme.palette.mode,
        style: {
          fontSize: '12px',
          fontFamily: 'Montserrat, sans-serif'
        },
      },
    };

    if (isPie) {
      return {
        ...baseOptions,
        labels: categories,
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: {
          position: 'bottom',
          labels: { colors: theme.palette.text.secondary }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { color: theme.palette.text.secondary },
                value: { color: theme.palette.text.primary, fontSize: '20px', fontWeight: 600 }
              }
            }
          }
        }
      };
    }

    const gridOptions = {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    };

    const axisOptions = {
      xaxis: {
        categories: categories,
        labels: { style: { colors: theme.palette.text.secondary } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: theme.palette.text.secondary } }
      }
    };

    if (isLine) {
      return {
        ...baseOptions,
        ...axisOptions,
        grid: gridOptions,
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 4 },
        dataLabels: { enabled: false },
        legend: { show: false }
      };
    }

    return {
      ...baseOptions,
      ...axisOptions,
      grid: gridOptions,
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '40%',
          distributed: true
        }
      },
      dataLabels: { enabled: false },
      legend: { show: false }
    };
  };

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
      <Divider sx={{ mb: 3 }} />
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '1.5rem',
        padding: '0 10px'
      }}>
        <span style={{ fontSize: '1.3rem' }}>💎</span>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: theme.palette.text.primary }}>Estadísticas Premium</h2>
        <div style={{
          marginLeft: '10px',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: 'rgba(97, 87, 214, 0.1)',
          border: '1px solid rgba(97, 87, 214, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6157d6'
        }}>
          PRO
        </div>
      </div>

      <div className="stats-grid">
        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(dayLabels, false, ['#6157d6', '#f278b6'])} 
              series={[{ name: 'Nuevos Clientes', data: last7DaysData }]} 
              type="bar" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Nuevos Clientes - Últimos 7 Días</span>
          </div>
        </div>

        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(Object.keys(ageRanges), false, ['#6157d6', '#f278b6', '#3b82f6', '#10b981'])} 
              series={[{ name: 'Clientes', data: Object.values(ageRanges) }]} 
              type="bar" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Distribución de clientes por rango de edad</span>
          </div>
        </div>

        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(["Meses promedio", "Referencia (12 meses)"], true, ['#6157d6', '#f278b6'])} 
              series={[Number(avgStay) || 0, 12]} 
              type="donut" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Permanencia promedio de clientes</span>
          </div>
        </div>

        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(["Mes anterior", "Mes actual"], false, ['#f278b6', '#6157d6'])} 
              series={[{ name: 'Ingresos', data: [lastMonthIncome, monthlyIncome] }]} 
              type="bar" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Ingresos proyectados ({gymInfo?.monthly_currency || "CUP"})</span>
          </div>
        </div>

        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(["Con pago", "Sin pago"], true, ['#10b981', '#ef4444'])} 
              series={[weeklyPayers, membersList.length - weeklyPayers]} 
              type="donut" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Clientes con pago en la semana actual</span>
          </div>
        </div>

        <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
          <div style={{ width: '100%' }}>
            <ReactApexChart 
              options={getChartOptions(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], false, ['#6157d6'], true)} 
              series={[{ name: 'Pagos', data: paymentsByMonth }]} 
              type="line" 
              height={250} 
            />
            <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Tendencia de pagos mensuales</span>
          </div>
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
