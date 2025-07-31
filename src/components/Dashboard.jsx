
import { Button, Divider, Grid, useTheme, Select, MenuItem, Skeleton, useMediaQuery } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link, useLocation } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../supabase/client';

const pieParams = { height: 250, margin: { right: 5 } };

export default function Dashboard() {
  const theme = useTheme();
  const location = useLocation();

  const { getDashboardData, membersList, trainersList, setNavBarOptions, daysRemaining } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([]);
  const [elemntsByTrainer, setElemntsByTrainer] = useState([]);
  const [trainersName, setTrainerName] = useState([]);
  const [membersActive, setMembersActive] = useState([]);
  const [membersByMonth, setMembersByMonth] = useState(Array(12).fill(0));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [membersByYear, setMembersByYear] = useState({});
  const [years, setYears] = useState([]);
  const palette = [theme.palette.primary.main, theme.palette.primary.accent];
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

          setYears(yearsFounded)

          if (membersTrainers) {
            setRelationMembersTrainers(membersTrainers);
            handlerElemntsByTrainer(membersTrainers);
          }
          setMembersActive(membersListActive);
          setTrainerName(membersTrainers.trainers?.filter(trainer => trainer !== null));
          setMembersByYear(membersTrainers.membersByYear);
          setMembersByMonth(membersTrainers.membersByYear[selectedYear] || Array(12).fill(0));
        }
      }, 1000);
    };
    dataForDashboard();
  }, [membersList]);


  const handleYearChange = (event) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    console.log(membersByYear)
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
        <div>
          {
            isMobile && daysRemaining <= 3 &&
            <span style={{ position: 'absolute', marginLeft: "4rem" }}>
              Su cuenta quedará inactiva en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
            </span>
          }

          <Grid container className='charts-container'>
            <Grid item xl={3} lg={3} md={6} sm={12} xs={12} className={theme.palette.mode === 'dark' ? 'chart-box-dark' : 'chart-box-light'} sx={{ visibility: membersActive.length > 0 ? "visible" : "hidden", marginTop: "2rem" }}>
              {membersActive.length > 0 ?
                <div>
                  <BarChart
                    sx={{
                      '& .MuiBarElement-root:nth-of-type(1)': {
                        fill: theme.palette.mode === 'dark' ? theme.palette.primary.optional : theme.palette.primary.main,
                      },
                      '& .MuiBarElement-root:nth-of-type(2)': { fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.accent },
                    }}
                    xAxis={[{
                      scaleType: 'band',
                      data: ['Clientes activos', 'Entrenadores'],
                      categoryGapRatio: 0.5,
                      barGapRatio: 1
                    }]}
                    series={[{ data: [membersActive.length, trainersList.length] }]}
                    height={250}
                    slotProps={{
                      bar: {
                        clipPath: `inset(0px round 3px 3px 0px 0px)`,
                      },
                    }}
                  />
                  <span>Totales</span>
                </div>
                :
                <>
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={250}
                    sx={{ borderRadius: '4px', backgroundColor: "transparent", }}
                  />
                  <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, backgroundColor: "transparent", }} />
                </>
              }
            </Grid>

            <Grid item xl={3} lg={3} md={6} sm={12} xs={12} className={theme.palette.mode === 'dark' ? 'chart-box-dark' : 'chart-box-light'} sx={{ visibility: relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ? 'visible' : 'hidden' }}>

              {relationMembersTrainers?.male?.length > 0 || relationMembersTrainers?.female?.length > 0 ?
                <div>
                  <BarChart
                    sx={{
                      '& .MuiBarElement-root:nth-of-type(1)': {
                        fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                      },
                      '& .MuiBarElement-root:nth-of-type(2)': { fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.accent },
                    }}
                    xAxis={[{
                      scaleType: 'band',
                      data: ['Hombres', 'Mujeres'],
                      categoryGapRatio: 0.5,
                      barGapRatio: 1
                    }]}
                    series={[{ data: [relationMembersTrainers?.male?.length, relationMembersTrainers?.female?.length] }]}
                    height={250}
                    slotProps={{
                      bar: {
                        clipPath: `inset(0px round 3px 3px 0px 0px)`,
                      },
                    }}
                  />
                  <span>Hombres / Mujeres</span>
                </div>
                :
                <>
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={250}
                    sx={{ borderRadius: '4px', backgroundColor: "transparent", }}
                  />
                  <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, backgroundColor: "transparent", }} />
                </>
              }
            </Grid>

            <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={theme.palette.mode === 'dark' ? 'chart-box-dark' : 'chart-box-light'} sx={{ visibility: relationMembersTrainers?.withoutTrainer?.length > 0 || relationMembersTrainers?.withTrainer?.length > 0 ? "visible" : "hidden" }}>

              {
                relationMembersTrainers?.withoutTrainer?.length > 0 ||
                  relationMembersTrainers?.withTrainer?.length > 0 ?
                  <div>
                    <PieChart
                      colors={palette}
                      series={[
                        {
                          data: [
                            { id: 0, value: relationMembersTrainers?.withTrainer?.length, label: 'Con Entrenador' },
                            { id: 1, value: relationMembersTrainers?.withoutTrainer?.length, label: 'Sin Entrenador' },
                          ],
                          innerRadius: 25,
                          outerRadius: 80,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          startAngle: -180,
                          endAngle: 180,
                          cx: 80,
                          cy: 100,
                        }
                      ]}
                      {...pieParams}
                    />
                    <span>Relación Cliente / Entrenador</span>
                  </div>
                  :
                  <>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width="100%"
                      height={250}
                      sx={{ borderRadius: '4px', backgroundColor: "transparent", }}
                    />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, backgroundColor: "transparent", }} />
                  </>
              }
            </Grid>
          </Grid>

          <Grid container className='charts-container'>
            <Grid Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={theme.palette.mode === 'dark' ? 'chart-box-dark' : 'chart-box-light'} sx={{ visibility: membersActive.length > 0 ? "visible" : "hidden" }}>
              {
                membersActive.length > 0 ?
                  <div>
                    <BarChart
                      sx={{
                        '& .MuiBarElement-root:nth-of-type(odd)': {
                          fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                        },
                        '& .MuiBarElement-root:nth-of-type(even)': {
                          fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.accent,
                        },
                      }}
                      xAxis={[{
                        scaleType: 'band',
                        data: [
                          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Deciembre'
                        ],
                        categoryGapRatio: 0.5,
                        barGapRatio: 1,
                      }]}
                      series={[{
                        data: membersByMonth
                      }]}
                      height={250}
                      slotProps={{
                        bar: {
                          clipPath: `inset(0px round 3px 3px 0px 0px)`,
                        },
                      }}
                    />
                    <span>Nuevos Clientes / Mes</span>
                    <Select
                      value={selectedYear}
                      onChange={handleYearChange}
                      sx={{ position: "absolute", top: 0, right: 0 }}
                    >
                      {years.length > 0 && years.map(year => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  :
                  <>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width="100%"
                      height={250}
                      sx={{
                        borderRadius: '4px',
                        backgroundColor: "transparent",
                      }}
                    />
                    <Skeleton animation="wave"
                      variant="text" width="40%" sx={{ mt: 1, backgroundColor: "transparent", }} />
                  </>
              }
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={theme.palette.mode === 'dark' ? 'chart-box-dark' : 'chart-box-light'} sx={{ visibility: elemntsByTrainer.length > 0 ? "visible" : "hidden" }}>

              {
                elemntsByTrainer.length > 0 || trainersName.length > 0 ?
                  <div>
                    <BarChart
                      sx={{
                        '& .MuiBarElement-root:nth-of-type(odd)': {
                          fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                        },
                        '& .MuiBarElement-root:nth-of-type(even)': {
                          fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.accent,
                        },
                      }}
                      xAxis={[{
                        scaleType: 'band', data: trainersName, categoryGapRatio: 0.5,
                        barGapRatio: 1,
                      }]}
                      series={[{
                        data: elemntsByTrainer
                      }]}
                      height={250}
                      slotProps={{
                        bar: {
                          clipPath: `inset(0px round 3px 3px 0px 0px)`,
                        },
                      }}
                    />
                    <span>Entrenador / Cliente</span>
                  </div>
                  :
                  <>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width="100%"
                      height={250}
                      sx={{ borderRadius: '4px', backgroundColor: "transparent", }}
                    />
                    <Skeleton animation="wave" variant="text" width="40%" sx={{ mt: 1, backgroundColor: "transparent", }} />
                  </>
              }
            </Grid>
          </Grid>
        </div >

        <br />
        <div style={{ padding: "1rem 1rem 5rem 1rem" }}>
          <Divider />
          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <span>Listado de clientes</span>
            <Link to="/new_member"
              state={{ from: location.pathname }}
              style={{ color: "white", textDecoration: "none" }}>
              <Button
                variant="contained"
                className={theme.palette.mode === 'dark' ? "client-btn-dark" : "client-btn-light"}
                style={{ display: "flex", justifyContent: "space-evenly" }}
              >
                <PersonAddIcon sx={{ mr: 1.2 }} /> Cliente
              </Button>
            </Link>
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