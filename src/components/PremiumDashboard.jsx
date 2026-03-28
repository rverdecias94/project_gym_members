/* eslint-disable react/prop-types */
import { Divider, useTheme } from "@mui/material";
import ReactApexChart from 'react-apexcharts';
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function PremiumDashboard({
  membersList,
  gymInfo,
}) {
  const theme = useTheme();
  const [ageRanges, setAgeRanges] = useState({});
  const [paymentStatus, setPaymentStatus] = useState({ upToDate: 0, delayed: 0 });
  const [birthdays, setBirthdays] = useState({ thisMonth: 0, otherMonths: 0 });
  const [weeklyPayers, setWeeklyPayers] = useState(0);
  const [paymentsByMonth, setPaymentsByMonth] = useState(Array(12).fill(0));
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [dayLabels, setDayLabels] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if html has dark class
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Setup an observer to watch for class changes on html
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const getChartOptions = (categories, isPie = false, customColors = null, isLine = false) => {
    const textColor = isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b'; // muted-foreground
    const primaryTextColor = isDarkMode ? 'hsl(210 40% 98%)' : '#0f172a'; // foreground

    const baseOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Winky Rough, Montserrat, sans-serif',
      },
      colors: customColors || ['#6164c7', '#32aaf4', '#e49c10'],
      theme: {
        mode: isDarkMode ? 'dark' : 'light',
      },
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Winky Rough, Montserrat, sans-serif'
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
          labels: { colors: textColor }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { color: textColor },
                value: { color: primaryTextColor, fontSize: '20px', fontWeight: 600 }
              }
            }
          }
        }
      };
    }

    const gridOptions = {
      borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.05)',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    };

    const axisOptions = {
      xaxis: {
        categories: categories,
        labels: { style: { colors: textColor } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: textColor } }
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

      // ---- Estado de Pagos (Al día vs Atrasados) ----
      let upToDate = 0;
      let delayed = 0;
      membersList.forEach((m) => {
        if (!m.active) return;
        if (!m.pay_date) {
          delayed++;
          return;
        }
        const payDate = new Date(m.pay_date);
        payDate.setHours(0, 0, 0, 0);
        const current = new Date();
        current.setHours(0, 0, 0, 0);
        if (payDate < current) {
          delayed++;
        } else {
          upToDate++;
        }
      });
      setPaymentStatus({ upToDate, delayed });

      // ---- Cumpleaños del mes ----
      let birthdaysThisMonth = 0;
      let birthdaysOtherMonths = 0;
      const currentMonth = today.getMonth();
      membersList.forEach((m) => {
        if (m.ci && m.ci.length >= 6) {
          let month = parseInt(m.ci.substring(2, 4), 10) - 1;
          if (month === currentMonth) {
            birthdaysThisMonth++;
          } else {
            birthdaysOtherMonths++;
          }
        }
      });
      setBirthdays({ thisMonth: birthdaysThisMonth, otherMonths: birthdaysOtherMonths });

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
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💎</span>
        <h2 className="m-0 text-[1.4rem] font-semibold text-foreground">Estadísticas Premium</h2>
        <div className="ml-2 px-2 py-0.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          PRO
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(dayLabels, false, ['#6157d6', '#f278b6'])}
                series={[{ name: 'Nuevos Clientes', data: last7DaysData }]}
                type="bar"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Nuevos Clientes - Últimos 7 Días</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(Object.keys(ageRanges), false, ['#6157d6', '#f278b6', '#3b82f6', '#10b981'])}
                series={[{ name: 'Clientes', data: Object.values(ageRanges) }]}
                type="bar"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Distribución de clientes por rango de edad</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(["Al día", "Atrasados"], true, ['#10b981', '#ef4444'])}
                series={[paymentStatus.upToDate, paymentStatus.delayed]}
                type="donut"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Estado de pagos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(["Este mes", "Resto del año"], true, ['#32aaf4', '#6157d6'])}
                series={[birthdays.thisMonth, birthdays.otherMonths]}
                type="donut"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Cumpleaños de clientes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(["Con pago", "Sin pago"], true, ['#10b981', '#ef4444'])}
                series={[weeklyPayers, membersList.length - weeklyPayers]}
                type="donut"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Clientes con pago en la semana actual</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border shadow-sm">
          <CardContent className="p-5 h-full transition-all duration-300">
            <div className="w-full">
              <ReactApexChart
                options={getChartOptions(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], false, ['#6157d6'], true)}
                series={[{ name: 'Pagos', data: paymentsByMonth }]}
                type="line"
                height={250}
              />
              <span className="block text-center mt-2.5 text-foreground font-semibold">Tendencia de pagos mensuales</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
