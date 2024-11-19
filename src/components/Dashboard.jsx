
import { Button, Divider, Grid, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../supabase/client';

const pieParams = { height: 250, margin: { right: 5 } };

export default function Dashboard() {
  const theme = useTheme();

  const { getTrainers, getMembers, membersList, trainersList, setNavBarOptions } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([]);
  const [elemntsByTrainer, setElemntsByTrainer] = useState([]);
  const [trainersName, setTrainerName] = useState([]);
  const [membersActive, setMembersActive] = useState([]);

  const palette = [theme.palette.primary.main, theme.palette.secondary.dark];
  useEffect(() => {
    setTimeout(() => {
      getTrainers();
      getMembers();
      setNavBarOptions(true);
    }, 500)
  }, [])


  useEffect(() => {
    const dataForDashborad = async () => {
      if (membersList.length > 0) {
        let membersListActive = membersList.filter(item => item.active)

        const { data } = await supabase.auth.getUser();
        await supabase
          .from("info_general_gym")
          .update({ clients: membersListActive.length })
          .eq("owner_id", data?.user?.id);


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
          return acc;

        }, { groupByTrainer: [], withTrainer: [], withoutTrainer: [], male: [], female: [], trainers: [] });

        if (membersTrainers) {
          setRelationMembersTrainers(membersTrainers);
          handlerElemntsByTrainer(membersTrainers)
        }
        setMembersActive(membersListActive);
        setTrainerName(membersTrainers.trainers?.filter(trainer => trainer !== null))
      }
    }
    dataForDashborad();
  }, [membersList])


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
        <Grid container style={{ display: "flex", justifyContent: "start", flexWrap: "wrap" }}>

          {((membersActive.length > 0 || trainersList.length > 0)) &&
            <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
              textAlign: 'center'
            }}>
              <BarChart
                sx={{
                  '& .MuiBarElement-root:nth-of-type(1)': {
                    fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                  },
                  '& .MuiBarElement-root:nth-of-type(2)': { fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark },
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
            </Grid>
          }

          {relationMembersTrainers?.withTrainer?.length > 0 &&
            <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
              textAlign: 'center'
            }}>
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
                <span>Relación Cliente/Entrenador</span>
              </div>
            </Grid>
          }

          {relationMembersTrainers?.male?.length > 0 &&
            <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
              textAlign: 'center'
            }}>
              <BarChart
                sx={{
                  '& .MuiBarElement-root:nth-of-type(1)': {
                    fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                  },
                  '& .MuiBarElement-root:nth-of-type(2)': { fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark },
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
              <span>Hombres/Mujeres</span>
            </Grid>
          }

          {elemntsByTrainer.length > 0 &&
            <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
              textAlign: 'center'
            }}>
              <BarChart
                sx={{
                  '& .MuiBarElement-root:nth-of-type(odd)': {
                    fill: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                  },
                  '& .MuiBarElement-root:nth-of-type(even)': {
                    fill: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
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
              <span>Entrenador/Cliente</span>
            </Grid>
          }

        </Grid>
        <br />
        <div style={{ padding: "1rem 1rem 5rem 1rem" }}>
          <Divider />
          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <span>Listado de clientes</span>
            <Link to="/new_member" style={{ color: "white", textDecoration: "none" }}>
              <Button
                variant="contained"
                style={{ display: "flex", justifyContent: "space-evenly", background: theme.palette.mode === 'dark' ? theme.palette.accent.main : theme.palette.accent.dark, color: "white" }}
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