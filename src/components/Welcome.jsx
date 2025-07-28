import { Button, Grid, useTheme } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link } from 'react-router-dom'
const Welcome = () => {
  const theme = useTheme();
  return (

    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className='dashboard-container'
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, height: "80%" }}>
      <h1>
        🎉 ¡Bienvenido a tu Sistema de Gestión de Gimnasios!
      </h1>

      <p>

        Hola 👋, nos alegra tenerte con nosotros.
        Desde aquí podrás gestionar tu gimnasio de forma fácil y rápida: registra a tus miembros y entrenadores.
      </p>
      <p>
        También podrás ver estadísticas de tu gimnasio, como la cantidad de clientes activos, entrenadores, la relación de clientes y entrenadores y más.
      </p>
      <h2>
        ¡Vamos a hacerlo juntos!
      </h2>
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
    </Grid>
  )
}

export default Welcome