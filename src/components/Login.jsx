import { Grid, Typography, IconButton } from '@mui/material';
import GoogleSignIn from './GoogleSignIn';
/* import PhoneSignIn from './PhoneSignIn'; */
import { useTheme } from '@mui/material/styles';
import { Brightness7 } from '@mui/icons-material';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// eslint-disable-next-line react/prop-types
const SignIn = ({ mode, toggleTheme }) => {

  const backgroundColor = "linear-gradient(180deg, rgb(220 221 249 / 50%), #aaace4de)"
  const theme = useTheme();
  return (
    <Grid
      container
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.mode === 'dark' ? theme.palette.background.default : backgroundColor,
        padding: '20px',
        position: 'relative',
      }}
    >
      <IconButton title="Oscuro / Claro" onClick={toggleTheme} color="inherit" style={{ marginRight: 10, position: "absolute", top: "1rem", right: "1rem" }}>
        {mode ? <DarkModeIcon /> : <Brightness7 />}
      </IconButton>

      <Grid item lg={3} xl={3} md={4} sm={6} xs={12} style={{
        textAlign: "center",
        background: theme.palette.mode === 'dark' ? "#141e2c" : theme.palette.primary.main,
        boxShadow: theme.palette.mode === 'dark' ? "0px 0px 5px 1px cyan" : "0px 0px 5px 1px white",
        height: "70vh",
        borderRadius: "3%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 10
      }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img className="" src="/logo.png" alt="logo" style={{ width: 200, height: 200 }} />
        </span>
        <div>
          <Typography variant="h6"
            sx={{
              fontWeight: 'bold',
              color: "white",
            }}>
            Nunca fue tan fácil
          </Typography>
          <Typography variant="h6"
            sx={{
              marginBottom: '30px',
              fontWeight: 'bold',
              color: "white",
            }}>
            ¡Simplifica la gestión de tu gimnasio!
          </Typography>
        </div>
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
