
import { Divider, Grid, useTheme, Select, MenuItem, Skeleton, useMediaQuery } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../supabase/client';
import PremiumDashboard from './PremiumDashboard';

export default function Dashboard() {
  const theme = useTheme();
  const { getDashboardData, membersList, trainersList, setNavBarOptions, daysRemaining, gymInfo } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([]);
  const [elemntsByTrainer, setElemntsByTrainer] = useState([]);
  const [trainersName, setTrainerName] = useState([]);
  const [membersActive, setMembersActive] = useState([]);
  const [membersByMonth, setMembersByMonth] = useState(Array(12).fill(0));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [membersByYear, setMembersByYear] = useState({});
  const [years, setYears] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const getChartOptions = (categories, isPie = false, customColors = null) => {
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

    return {
      ...baseOptions,
      xaxis: {
        categories: categories,
        labels: {
          style: { colors: theme.palette.text.secondary }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: theme.palette.text.secondary }
        }
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
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

          const { data } = await supabase.auth.getUser();
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
          setSelectedYear(defaultYear);
          setMembersByMonth(membersTrainers.membersByYear[defaultYear] || Array(12).fill(0));
        }
      }, 1000);
    };
    dataForDashboard();
  }, [membersList]);


  const handleYearChange = (event) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    setMembersByMonth(membersByYear[year] || Array(12).fill(0));
  };

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
  const columns = [
    { field: 'first_name', headerName: 'Nombre', width: 240 },
    { field: 'last_name', headerName: 'Apellidos', width: 240 },
    { field: 'ci', headerName: 'CI', width: 220 },
    { field: 'address', headerName: 'Dirección', width: 280 },
    { field: 'trainer_name', headerName: 'Entrenador', width: 220 },
    { field: 'pay_date', headerName: 'Fecha de pago', width: 240 },
  ];

  const showDasboard = () => {
    return <>

      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}
      >
        <div style={{ padding: "0 1rem" }}>
          {
            isMobile && daysRemaining <= 3 &&
            <span style={{ position: 'absolute', marginLeft: "4rem" }}>
              Su cuenta quedará inactiva en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
            </span>
          }

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.5rem',
            marginTop: isMobile && daysRemaining <= 3 ? "3rem" : "1rem",
            padding: '0 10px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>📊</span>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: theme.palette.text.primary }}>Estadísticas Generales</h2>
          </div>

          <Grid container className='charts-container' spacing={2} sx={{ mb: 2 }}>
            <Grid item xl={3} lg={3} md={6} sm={12} xs={12} sx={{ visibility: membersActive.length > 0 ? "visible" : "hidden" }}>
              <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
                {membersActive.length > 0 ?
                  <div style={{ width: '100%' }}>
                    <ReactApexChart
                      options={getChartOptions(['Clientes', 'Entrenadores'], false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Total', data: [membersActive.length, trainersList.length] }]}
                      type="bar"
                      height={250}
                    />
                    <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Totales</span>
                  </div>
                  :
                  <>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={250} sx={{ borderRadius: '12px', bgcolor: 'transparent' }} />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, mx: 'auto', bgcolor: 'transparent' }} />
                  </>
                }
              </div>
            </Grid>

            <Grid item xl={3} lg={3} md={6} sm={12} xs={12} sx={{ visibility: relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ? 'visible' : 'hidden' }}>
              <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
                {relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ?
                  <div style={{ width: '100%' }}>
                    <ReactApexChart
                      options={getChartOptions(['Hombres', 'Mujeres'], false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Total', data: [relationMembersTrainers?.male?.length || 0, relationMembersTrainers?.female?.length || 0] }]}
                      type="bar"
                      height={250}
                    />
                    <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Hombres / Mujeres</span>
                  </div>
                  :
                  <>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={250} sx={{ borderRadius: '12px', bgcolor: 'transparent' }} />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, mx: 'auto', bgcolor: 'transparent' }} />
                  </>
                }
              </div>
            </Grid>

            <Grid item xl={6} lg={6} md={6} sm={12} xs={12} sx={{ visibility: relationMembersTrainers?.withoutTrainer?.length > 0 || relationMembersTrainers?.withTrainer?.length > 0 ? "visible" : "hidden" }}>
              <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
                {relationMembersTrainers?.withoutTrainer?.length > 0 || relationMembersTrainers?.withTrainer?.length > 0 ?
                  <div style={{ width: '100%' }}>
                    <ReactApexChart
                      options={getChartOptions(['Con Entrenador', 'Sin Entrenador'], true, ['#6157d6', '#f278b6'])}
                      series={[relationMembersTrainers?.withTrainer?.length || 0, relationMembersTrainers?.withoutTrainer?.length || 0]}
                      type="donut"
                      height={250}
                    />
                    <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Relación Cliente / Entrenador</span>
                  </div>
                  :
                  <>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={250} sx={{ borderRadius: '12px', bgcolor: 'transparent' }} />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, mx: 'auto', bgcolor: 'transparent' }} />
                  </>
                }
              </div>
            </Grid>
          </Grid>

          <Grid container className='charts-container' spacing={2}>
            <Grid item xl={6} lg={6} md={6} sm={12} xs={12} sx={{ visibility: membersActive.length > 0 ? "visible" : "hidden" }}>
              <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', position: 'relative', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
                {membersActive.length > 0 ?
                  <div style={{ width: '100%' }}>
                    <ReactApexChart
                      options={getChartOptions(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], false, ['#6157d6'])}
                      series={[{ name: 'Nuevos Clientes', data: membersByMonth }]}
                      type="area"
                      height={250}
                    />
                    <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Nuevos Clientes / Mes</span>
                    <Select
                      value={selectedYear}
                      onChange={handleYearChange}
                      size="small"
                      sx={{ position: "absolute", top: 15, right: 20, height: 32, fontSize: '0.8rem', borderRadius: '8px', backgroundColor: theme.palette.background.paper }}
                    >
                      {years.length > 0 && years.map(year => (
                        <MenuItem key={year} value={year} sx={{ fontSize: '0.8rem' }}>{year}</MenuItem>
                      ))}
                    </Select>
                  </div>
                  :
                  <>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={250} sx={{ borderRadius: '12px', bgcolor: 'transparent' }} />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, mx: 'auto', bgcolor: 'transparent' }} />
                  </>
                }
              </div>
            </Grid>

            <Grid item xl={6} lg={6} md={6} sm={12} xs={12} sx={{ visibility: elemntsByTrainer.length > 0 ? "visible" : "hidden" }}>
              <div className="custom-chart-card" style={{ padding: '20px', borderRadius: '16px', height: '100%', transition: 'all 0.3s ease', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f3f4fa', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(97, 87, 214, 0.2)'}` }}>
                {elemntsByTrainer.length > 0 || trainersName.length > 0 ?
                  <div style={{ width: '100%' }}>
                    <ReactApexChart
                      options={getChartOptions(trainersName, false, ['#6157d6', '#f278b6'])}
                      series={[{ name: 'Clientes', data: elemntsByTrainer }]}
                      type="bar"
                      height={250}
                    />
                    <span style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: theme.palette.text.primary, fontWeight: 600 }}>Entrenador / Cliente</span>
                  </div>
                  :
                  <>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={250} sx={{ borderRadius: '12px', bgcolor: 'transparent' }} />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, mx: 'auto', bgcolor: 'transparent' }} />
                  </>
                }
              </div>
            </Grid>
          </Grid>
        </div >

        {gymInfo?.active && gymInfo?.store && (
          <PremiumDashboard
            membersList={membersList}
            gymInfo={gymInfo}
          />
        )}

        <br />
        <div style={{ padding: "1rem 1rem 5rem 1rem" }}>
          <Divider />
          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <span>Listado de clientes</span>
          </div>
          <br />
          <DataGrid
            rows={membersActive}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>

      </Grid >

    </>
  }


  const getView = () => {
    return showDasboard();
  }

  return getView();
}