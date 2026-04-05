
import ReactApexChart from 'react-apexcharts';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../supabase/client';
import PremiumDashboard from './PremiumDashboard';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { getDashboardData, membersList, trainersList, setNavBarOptions, daysRemaining, gymInfo, getAuthUser } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([]);
  const [elemntsByTrainer, setElemntsByTrainer] = useState([]);
  const [trainersName, setTrainerName] = useState([]);
  const [membersActive, setMembersActive] = useState([]);
  const [membersByMonth, setMembersByMonth] = useState(Array(12).fill(0));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [membersByYear, setMembersByYear] = useState({});
  const [years, setYears] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState({ gym: Array(12).fill(0), trainer: Array(12).fill(0) });
  const [incomeCurrency, setIncomeCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);
  const isMobile = window.innerWidth <= 768;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

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

  const getChartOptions = (categories, isPie = false, customColors = null) => {
    const textColor = isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b'; // muted-foreground
    const primaryTextColor = isDarkMode ? 'hsl(210 40% 98%)' : '#0f172a'; // foreground

    const baseOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Montserrat, sans-serif',
      },
      colors: customColors || ['#6164c7', '#e49c10', '#ef74b9'],
      theme: {
        mode: isDarkMode ? 'dark' : 'light',
      },
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
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

    return {
      ...baseOptions,
      xaxis: {
        categories: categories,
        labels: {
          style: { colors: textColor }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: textColor }
        }
      },
      grid: {
        borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.05)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      },
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
    setTimeout(() => {
      getDashboardData();
      setNavBarOptions(true);
    }, 500)
  }, [])

  useEffect(() => {
    const dataForDashboard = () => {
      setTimeout(async () => {
        if (membersList.length > 0) {
          let membersListActive = membersList.filter(item => item.active);

          const { data } = await getAuthUser();
          try {
            const cachedGymInfo = sessionStorage.getItem("gym_info");
            if (cachedGymInfo) {
              const parsed = JSON.parse(cachedGymInfo);
              parsed.clients = membersListActive.length;
              sessionStorage.setItem("gym_info", JSON.stringify(parsed));
            }
          } catch (e) {
            console.error(e);
          }
          await supabase
            .from("info_general_gym")
            .update({ clients: membersListActive.length })
            .eq("owner_id", data?.user?.id);

          let yearsFounded = [];

          let membersTrainers = membersListActive.reduce((acc, member) => {
            if (member.has_trainer) {
              const trainerName = member.trainer_name;
              if (!acc.trainers?.includes(trainerName)) {
                acc.trainers.push(trainerName);
              }
              if (!acc.groupByTrainer[trainerName]) {
                acc.groupByTrainer[trainerName] = [];
              }
              acc.groupByTrainer[trainerName].push(member);
              acc.withTrainer.push(member);
            } else {
              acc.withoutTrainer.push(member);
            }
            member.gender === "M" ? acc.male.push(member) : acc.female.push(member);

            // Contar miembros por mes
            const createdAt = new Date(member.created_at);
            const year = createdAt.getFullYear();
            const month = createdAt.getMonth();

            if (!yearsFounded.includes(year)) {
              yearsFounded.push(year);
            }

            if (!acc.membersByYear[year]) {
              acc.membersByYear[year] = Array(12).fill(0);
            }
            acc.membersByYear[year][month] += 1;

            return acc;
          }, {
            groupByTrainer: [],
            withTrainer: [],
            withoutTrainer: [],
            male: [],
            female: [],
            trainers: [],
            membersByMonth: Array(12).fill(0),
            membersByYear: {},
          });

          setYears(yearsFounded.sort((a, b) => b - a))

          if (membersTrainers) {
            setRelationMembersTrainers(membersTrainers);
            handlerElemntsByTrainer(membersTrainers);
          }
          setMembersActive(membersListActive);
          setTrainerName(membersTrainers.trainers?.filter(trainer => trainer !== null));
          setMembersByYear(membersTrainers.membersByYear);

          // Establecer el año seleccionado por defecto al año más reciente disponible, o al año actual si no hay datos
          const defaultYear = yearsFounded.length > 0 ? Math.max(...yearsFounded) : new Date().getFullYear();
          setSelectedYear(defaultYear.toString());
          setMembersByMonth(membersTrainers.membersByYear[defaultYear] || Array(12).fill(0));

          // Cargar datos de ingresos mensuales
          await loadMonthlyIncome();
        }
      }, 1000);
    };
    dataForDashboard();
  }, [membersList]);


  const handleYearChange = (value) => {
    const year = parseInt(value, 10);
    setSelectedYear(value);
    setMembersByMonth(membersByYear[year] || Array(12).fill(0));
    loadMonthlyIncome();
  };

  useEffect(() => {
    loadMonthlyIncome();
  }, [incomeCurrency]);

  const handlerElemntsByTrainer = (membersTrainers) => {
    if (membersTrainers?.groupByTrainer) {
      let keys = Object.keys(membersTrainers?.groupByTrainer)
      let clientsByTrainer = [];
      keys.forEach(key => {
        clientsByTrainer.push(membersTrainers?.groupByTrainer[key].length)
      })
      setElemntsByTrainer(clientsByTrainer)
    }
  }

  const loadMonthlyIncome = async () => {
    try {
      const { data } = await getAuthUser();
      const currentYear = parseInt(selectedYear);

      // Obtener pagos del gimnasio
      const { data: gymPayments, error: gymError } = await supabase
        .from('payment_history_members')
        .select('quantity_paid, created_at, next_payment')
        .eq('gym_id', data?.user?.id)
        .gte('next_payment', `${currentYear}-01-01`)
        .lte('next_payment', `${currentYear}-12-31`);

      if (gymError) {
        console.error('Error al cargar pagos del gimnasio:', gymError);
        return;
      }
      // Procesar pagos por mes y tipo
      const gymIncomeByMonth = Array(12).fill(0);
      const trainerIncomeByMonth = Array(12).fill(0);
      const currenciesFound = new Set(['USD']);

      gymPayments?.forEach(payment => {
        const paymentDate = new Date(payment.next_payment);
        const month = paymentDate.getMonth() - 1;
        const amountGym = parseFloat(payment.quantity_paid.gym_cost) || 0;
        const amountTrainer = parseFloat(payment.quantity_paid.trainer_cost) || 0;
        const currencyGym = payment.quantity_paid.gym_currency || 'USD';
        const currencyTrainer = payment.quantity_paid.trainer_currency || 'USD';

        if (currencyGym !== null)
          currenciesFound.add(currencyGym);
        if (currencyTrainer !== null)
          currenciesFound.add(currencyTrainer);
        if (currencyGym === incomeCurrency) {
          gymIncomeByMonth[month] += amountGym;
        }
        if (currencyTrainer === incomeCurrency) {
          trainerIncomeByMonth[month] += amountTrainer;
        }
      });

      setMonthlyIncome({
        gym: gymIncomeByMonth,
        trainer: trainerIncomeByMonth
      });

      setAvailableCurrencies(Array.from(currenciesFound).sort());

    } catch (error) {
      console.error('Error al cargar ingresos mensuales:', error);
    }
  };
  const columns = [
    { field: 'first_name', headerName: 'Nombre', width: 240 },
    { field: 'last_name', headerName: 'Apellidos', width: 240 },
    { field: 'ci', headerName: 'CI', width: 220 },
    { field: 'address', headerName: 'Dirección', width: 280 },
    { field: 'trainer_name', headerName: 'Entrenador', width: 220 },
    { field: 'pay_date', headerName: 'Fecha de pago', width: 240 },
  ];

  const showDasboard = () => {
    return (
      <div className="w-full">
        <div className="px-4 md:px-4 max-w-[1400px] mx-auto pt-6">
          <div className={`flex items-center gap-2 mb-6 mt-4 px-2`}>
            <span className="text-2xl">📊</span>
            <h2 className="m-0 text-2xl font-semibold text-foreground">Estadísticas Generales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Card className={`col-span-1 ${membersActive.length > 0 ? "visible" : "hidden"} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {membersActive.length > 0 ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={getChartOptions(['Clientes', 'Entrenadores'], false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Total', data: [membersActive.length, trainersList.length] }]}
                      type="bar"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Totales</span>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`col-span-1 ${relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ? 'visible' : 'hidden'} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={getChartOptions(['Hombres', 'Mujeres'], false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Total', data: [relationMembersTrainers?.male?.length || 0, relationMembersTrainers?.female?.length || 0] }]}
                      type="bar"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Hombres / Mujeres</span>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`col-span-1 ${relationMembersTrainers?.withoutTrainer?.length > 0 || relationMembersTrainers?.withTrainer?.length > 0 ? "visible" : "hidden"} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {relationMembersTrainers?.withoutTrainer?.length > 0 || relationMembersTrainers?.withTrainer?.length > 0 ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={getChartOptions(['Con Entrenador', 'Sin Entrenador'], true, ['#6157d6', '#f278b6'])}
                      series={[relationMembersTrainers?.withTrainer?.length || 0, relationMembersTrainers?.withoutTrainer?.length || 0]}
                      type="donut"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Relación Cliente / Entrenador</span>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`col-span-1 relative ${membersActive.length > 0 ? "visible" : "hidden"} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {membersActive.length > 0 ? (
                  <div className="w-full relative">
                    <ReactApexChart
                      options={getChartOptions(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], false, ['#6157d6'])}
                      series={[{ name: 'Nuevos Clientes', data: membersByMonth }]}
                      type="area"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Nuevos Clientes / Mes</span>
                    <div className="absolute top-0 right-0 w-24">
                      <Select value={selectedYear} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.length > 0 && years.map(year => (
                            <SelectItem key={year} value={year.toString()} className="text-xs">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`col-span-1 ${elemntsByTrainer.length > 0 ? "visible" : "hidden"} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {elemntsByTrainer.length > 0 || trainersName.length > 0 ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={getChartOptions(trainersName, false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Clientes', data: elemntsByTrainer }]}
                      type="bar"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Entrenador / Cliente</span>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={`col-span-1 ${membersList.length > 0 ? "visible" : "hidden"} bg-card border-border shadow-sm`}>
              <CardContent className="p-5 h-full transition-all duration-300">
                {membersList.length > 0 ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={getChartOptions(['Activos', 'Inactivos'], true, ['#10b981', '#ef4444'])}
                      series={[membersActive.length, membersList.length - membersActive.length]}
                      type="donut"
                      height={250}
                    />
                    <span className="block text-center mt-2.5 text-foreground font-semibold">Estado de Clientes</span>
                  </div>
                ) : (
                  <>
                    <Skeleton className="w-full h-[250px] rounded-xl" />
                    <Skeleton className="w-2/5 h-4 mt-2.5 mx-auto" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Ingresos Mensuales */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
            <Card className={`bg-card border-border shadow-sm`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Ingresos Mensuales</h3>
                  <div className="flex gap-2">
                    <Select value={incomeCurrency} onValueChange={setIncomeCurrency}>
                      <SelectTrigger className="h-8 text-xs w-20">
                        <SelectValue placeholder="Moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map(currency => (
                          <SelectItem key={currency} value={currency} className="text-xs">
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                      <SelectTrigger className="h-8 text-xs w-20">
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.length > 0 && years.map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-xs">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {monthlyIncome.gym.some(amount => amount > 0) || monthlyIncome.trainer.some(amount => amount > 0) ? (
                  <div className="w-full">
                    <ReactApexChart
                      options={{
                        ...getChartOptions(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], false),
                        colors: ['#6157d6', '#e49c10'],
                        plotOptions: {
                          bar: {
                            borderRadius: 1,
                            columnWidth: '70%',
                            distributed: false,
                          },
                        },
                        yaxis: {
                          labels: {
                            style: { colors: isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b' },
                            formatter: (value) => `${incomeCurrency} ${value.toFixed(0)}`
                          }
                        }
                      }}
                      series={[
                        { name: 'Clientes', data: monthlyIncome.gym },
                        ...(trainersList.length > 0 ? [{ name: 'Entrenadores', data: monthlyIncome.trainer }] : [])
                      ]}
                      type={isMobile ? "bar" : "bar"}
                      height={300}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                    No hay datos de ingresos para {selectedYear}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {gymInfo?.active && gymInfo?.store && (
          <div className="px-4 md:px-4 max-w-[1400px] mx-auto">
            <PremiumDashboard
              membersList={membersList}
              gymInfo={gymInfo}
            />
          </div>
        )}

        <br />
        <div className="p-4 pb-20 max-w-[1400px] mx-auto">
          <Separator className="mb-4" />
          <div className="mt-5 flex gap-2.5 items-center justify-between">
            <span className="font-medium">Listado de clientes</span>
          </div>
          <br />
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <DataGrid
              rows={membersActive}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.1)',
                  color: isDarkMode ? 'hsl(var(--foreground))' : '#0f172a',
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.1)',
                  color: isDarkMode ? 'hsl(var(--muted-foreground))' : '#64748b',
                  backgroundColor: isDarkMode ? 'hsl(var(--muted))' : '#f8fafc',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.1)',
                  color: isDarkMode ? 'hsl(var(--muted-foreground))' : '#64748b',
                },
                '& .MuiTablePagination-root': {
                  color: isDarkMode ? 'hsl(var(--muted-foreground))' : '#64748b',
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }


  const getView = () => {
    return showDasboard();
  }

  return getView();
}
