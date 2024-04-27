
import { Grid } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';


export default function Dashboard() {
  const { getTrainers, getMembers, membersList, trainersList } = useMembers();
  const [relationMembersTrainers, setRelationMembersTrainers] = useState([])

  useEffect(() => {
    getTrainers();
    getMembers();
  }, [])

  useEffect(() => {
    if (membersList.length > 0) {
      let membersTrainers = membersList.reduce((acc, member) => {
        member.has_trainer ? acc?.withTrainer?.push(member) : acc?.withoutTrainer?.push(member);
        member.gender === "M" ? acc?.male?.push(member) : acc?.female?.push(member);
        return acc;
      }, { withTrainer: [], withoutTrainer: [], male: [], female: [] });
      setRelationMembersTrainers(membersTrainers)
    }
  }, [membersList])



  return (
    <>
      <Grid container style={{ display: "flex", gap: 20, /* flexWrap: "nowrap" */ }}>
        <Grid item xl={3} lg={3} md={4} sm={6} xs={12}
          style={{
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flexWrap: "nowrap" }}>
            <div style={{ background: "rgb(223 235 249 / 49%)", height: "50%", padding: "19%" }}>
              Entrenadores: {trainersList.length}
            </div>
            <div style={{ background: "rgb(223 235 249 / 49%)", height: "50%", padding: "19%" }}>
              Total de miembros: {membersList.length}
            </div>
          </div>
        </Grid>
        <Grid item xl={
          3} lg={3} md={4} sm={6} xs={12}
          style={{
            background: "rgb(223 235 249 / 49%)",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          <span>Relación Miembro/Entrenador</span>
          <BarChart
            sx={{
              '& .MuiBarElement-root': { fill: "#356dac" },
            }}
            xAxis={[{ scaleType: 'band', data: ['Con Entrenador', 'Sin Entrenador'] }]}
            series={[{ data: [relationMembersTrainers?.withTrainer?.length, relationMembersTrainers?.withoutTrainer?.length] }]}
            height={300}
          />
        </Grid>
        <Grid item xl={3} lg={3} md={4} sm={6} xs={12}
          style={{
            background: "rgb(223 235 249 / 49%)",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          <span>Hombres/Mujeres</span>
          <BarChart
            sx={{
              '& .MuiBarElement-root': { fill: "#356dac" },
            }}
            xAxis={[{ scaleType: 'band', data: ['Hombres', 'Mujeres'] }]}
            series={[{ data: [relationMembersTrainers?.male?.length, relationMembersTrainers?.female?.length] }]}
            height={300}
          />
        </Grid>
      </Grid>
    </>
  );
}