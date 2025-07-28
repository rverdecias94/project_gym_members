import { Grid, Typography } from '@mui/material';
import GoogleSignIn from './GoogleSignIn';
/* import PhoneSignIn from './PhoneSignIn'; */

// eslint-disable-next-line react/prop-types
const SignIn = () => {
  return (
    <Grid
      container
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: "url(/login-bg.jpg) no-repeat center fixed",
        padding: '20px',
        backgroundSize: 'cover',
        position: 'relative',
      }}
    >


      <Grid item lg={3} xl={3} md={4} sm={6} xs={12} style={{
        textAlign: "center",
        background: "#282b824a",
        boxShadow: '#4f52b2 0px 0px 5px 1px',
        height: "70vh",
        borderRadius: "3%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 10,
        backdropFilter: 'blur(15px)',
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
