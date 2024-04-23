
import { Grid } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Dashboard() {
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
              Entrenadores: {"5"}
            </div>
            <div style={{ background: "rgb(223 235 249 / 49%)", height: "50%", padding: "19%" }}>
              Total de miembros: {"170"}
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
            xAxis={[{ scaleType: 'band', data: ['Con Entrenador', 'Sin Entrenador'] }]}
            series={[{ data: [86, 74] }]}

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
            xAxis={[{ scaleType: 'band', data: ['Hombres', 'Mujeres'] }]}
            series={[{ data: [100, 60] }]}
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
          <span>Relación Miembro/Entrenador</span>
          <BarChart
            xAxis={[{ scaleType: 'band', data: ['Con Entrenador', 'Sin Entrenador'] }]}
            series={[{ data: [86, 74] }]}

            height={300}
          />
        </Grid>
      </Grid>
    </>
  );
}