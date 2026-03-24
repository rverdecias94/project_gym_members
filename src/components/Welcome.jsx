import { Button, Grid, Typography, useTheme, Box, Paper } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from 'react';
import MembersForm from './MembersForm';

const Welcome = () => {

  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const theme = useTheme();
  
  return (
    <Grid 
      item 
      xl={12} lg={12} md={12} sm={12} xs={12} 
      className='dashboard-container'
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100%", 
        overflowY: "hidden",
        textAlign: "center", 
        padding: { xs: 3, md: 6 } 
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          padding: { xs: 4, md: 8 }, 
          borderRadius: 4, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 800, 
            color: theme.palette.mode === 'dark' ? '#fff' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          🎉 ¡Bienvenido a TRONOSS!
        </Typography>

        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            lineHeight: 1.6, 
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Nos alegra tenerte con nosotros. Desde aquí podrás gestionar tu gimnasio de forma fácil y rápida: registra a tus miembros y entrenadores.
        </Typography>

        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            lineHeight: 1.6, 
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          También podrás ver estadísticas de tu gimnasio, como la cantidad de clientes activos, entrenadores, la relación de clientes y entrenadores y más.
        </Typography>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 4,
              color: theme.palette.mode === 'dark' ? '#fff' : '#1a1a1a',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            ¡Vamos a hacerlo juntos!
          </Typography>

          <Button
            variant="contained"
            size="large"
            className={theme.palette.mode === 'dark' ? "client-btn-dark" : "client-btn-light"}
            onClick={handleOpen}
            sx={{ 
              px: 5, 
              py: 1.5, 
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'none',
              }
            }}
            startIcon={<PersonAddIcon sx={{ mr: 1, fontSize: '1.5rem !important' }} />}
          >
            Agregar Cliente
          </Button>
        </Box>
      </Paper>

      <MembersForm
        open={open}
        handleClose={handleClose}
      />
    </Grid>
  )
}

export default Welcome