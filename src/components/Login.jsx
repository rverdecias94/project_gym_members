import { Grid, Typography } from '@mui/material';
import GoogleSignIn from './GoogleSignIn';
import PhoneSignIn from './PhoneSignIn';

const SignIn = () => {
  return (
    <Grid
      container
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        padding: '20px'
      }}
    >
      <Grid item lg={4} xl={4} md={4} sm={6} xs={12} style={{ textAlign: 'center' }}>
        <Typography variant="h4" style={{ marginBottom: '30px', fontWeight: 'bold' }}>
          ¡Bienvenido!
        </Typography>
        <PhoneSignIn />
        <Typography variant="body1" style={{ margin: '20px 0', fontSize: '18px', color: '#888' }}>
          O
        </Typography>
        <GoogleSignIn />
      </Grid>
    </Grid>
  );
};

export default SignIn;

