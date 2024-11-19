import { Grid, Typography, IconButton } from '@mui/material';
import GoogleSignIn from './GoogleSignIn';
/* import PhoneSignIn from './PhoneSignIn'; */
import { useTheme } from '@mui/material/styles';
import { Brightness7 } from '@mui/icons-material';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// eslint-disable-next-line react/prop-types
const SignIn = ({ mode, toggleTheme }) => {
  const theme = useTheme();
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
      <IconButton title="Oscuro / Claro" onClick={toggleTheme} color="inherit" style={{ marginRight: 10, position: "absolute", top: "1rem", right: "1rem" }}>
        {mode ? <DarkModeIcon /> : <Brightness7 />}
      </IconButton>
      <Grid item lg={4} xl={4} md={5} sm={6} xs={12} style={{
        textAlign: "center",
        background: theme.palette.mode === 'dark' ? "#141e2c" : theme.palette.primary.main,
        boxShadow: "0px 0px 10px -1px #ccc",
        height: "85vh",
        borderRadius: "3%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 10
      }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img className="" src="/logo.png" alt="logo" style={{ width: 200, height: 200 }} />
        </span>
        <Typography variant="h4"
          sx={{
            marginBottom: '30px',
            fontWeight: 'bold',
            color: "white",
          }}>
          ¡Bienvenido!
        </Typography>
        <GoogleSignIn />
      </Grid>
    </Grid>
  );
};

export default SignIn;

{/*  <PhoneSignIn />
        <Typography variant="body1" style={{ margin: '20px 0', fontSize: '18px', color: '#888' }}>
          O
        </Typography> */}
