
import { Button, Grid, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { useTheme } from '@mui/material/styles';
import { supabase } from '../supabase/client';
import { useNavigate } from "react-router-dom";

const LoginAdmin = () => {
  const theme = useTheme()
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: null,
    password: null,
  })

  const handleChange = (e) => {
    let { name, value } = e.target;
    setCredentials(prev => (
      {
        ...prev,
        [name]: value
      }
    ))
  }
  const handleEnterAdminPanel = async () => {
    const { username, password } = credentials;
    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña");
      return;
    }

    try {
      // Consulta en la tabla `users_admin`
      const { data, error } = await supabase
        .from('users_admin')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Error al buscar en Supabase:', error.message);
        alert("Usuario o contraseña incorrectos");
        return;
      }

      if (data) {
        navigate('/admin/panel');
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Hubo un error al validar las credenciales");
    }
  };

  return (
    <Grid
      container
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.default,
        padding: '20px',
        position: 'relative',
      }}
    >
      <Grid item lg={4} xl={4} md={5} sm={6} xs={12} style={{
        textAlign: "center",
        background: theme.palette.mode === 'dark' ? "#141e2c" : theme.palette.primary.main,
        boxShadow: "0px 0px 10px -1px #ccc",
        height: "auto",
        borderRadius: "3%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        padding: 10,
        gap: 10
      }}>

        <TextField
          label="Usuario"
          type="text"
          value={credentials.username}
          onChange={handleChange}
          name="username"
          placeholder="mi_usuario"
          fullWidth
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Contraseña"
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="************"
          fullWidth
          inputProps={{ maxLength: 20 }}
        />

        <Button
          onClick={handleEnterAdminPanel}
          variant="outlined"
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: '16px',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
            borderColor: '#dadce0',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.light : theme.palette.background.default,
          }}
        >
          <Typography variant="h6"
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
            }}
          >
            Entrar al panel de Administración
          </Typography>
        </Button>
      </Grid>
    </Grid>
  )
}

export default LoginAdmin