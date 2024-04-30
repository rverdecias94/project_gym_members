
import { Button, Divider, Grid } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


const pieParams = { height: 250, margin: { right: 5 } };
const palette = ['rgb(53 109 172)', 'rgb(210 131 25 / 50%)'];

export default function Dashboard() {
  const { getTrainers, getMembers, membersList, trainersList } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([]);
  const [elemntsByTrainer, setElemntsByTrainer] = useState([]);
  const [trainersName, setTrainerName] = useState([]);
  const [membersActive, setMembersActive] = useState([]);

  useEffect(() => {
    getTrainers();
    getMembers();
  }, [])

  useEffect(() => {
    if (membersList.length > 0) {
      let membersListActive = membersList.filter(item => item.active)

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
      setTrainerName(membersTrainers.trainers)
    }
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
  return (
    <>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}
      >
        <Grid container style={{ display: "flex", justifyContent: "start", flexWrap: "wrap" }}>

          <Grid item xl={2} lg={3} md={6} sm={6} xs={12} style={{ marginBottom: 20 }}>
            <Grid container style={{ height: 250 }}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
                <span style={{ background: "rgb(210 131 25 / 50%)", color: "white", width: "50%", padding: 7, textAlign: "center", borderRadius: 3 }}>
                  Miembros activos: {membersActive.length}
                </span>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
                <span style={{ background: "rgb(210 131 25 / 50%)", color: "white", width: "50%", padding: 7, textAlign: "center", borderRadius: 3 }}>
                  Entrenadores: {trainersList.length}
                </span>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xl={4} lg={3} md={6} sm={6} xs={12} style={{
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
              <span>Relación Miembro/Entrenador</span>
            </div>
          </Grid>

          <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
            textAlign: 'center'
          }}>
            <BarChart
              sx={{
                '& .MuiBarElement-root': { fill: "#356dac" },
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

          <Grid item xl={3} lg={3} md={6} sm={6} xs={12} style={{
            textAlign: 'center'
          }}>
            <BarChart
              sx={{
                '& .MuiBarElement-root': { fill: "#356dac" },
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

        </Grid>
        <br />
        <Divider />
        <div>
          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <span>Listado de clientes</span>
            <Link to="/new_member" style={{ color: "white", textDecoration: "none" }}>
              <Button
                variant="contained"
                style={{ display: "flex", justifyContent: "space-evenly", background: "#356dac" }}
              >
                <PersonAddIcon sx={{ mr: 1.2 }} /> Miembro
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
  );
}