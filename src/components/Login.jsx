

import { useEffect, useState } from 'react';
import { Grid, Typography, Checkbox, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';

const SignIn = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si ya aceptó antes
    const accepted = localStorage.getItem('acceptedTerms');
    if (accepted === 'true') {
      setAcceptedTerms(true);
    }
  }, []);

  const handleTermsChange = (event) => {
    const checked = event.target.checked;
    setAcceptedTerms(checked);
    if (checked) {
      localStorage.setItem('acceptedTerms', 'true');
    } else {
      localStorage.removeItem('acceptedTerms');
    }
  };


  const handleTermsClick = () => {
    navigate(window.open('/terms-conditions', '_blank'));
  }; ('/terms-conditions', '_blank');


  return (
    <Grid container style={{ marginTop: "-6rem", minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: "url(/login-bg.jpg) no-repeat center fixed", padding: 20, backgroundSize: 'cover' }}>
      <Grid item lg={3} md={4} sm={6} xs={12} style={{ textAlign: "center", background: "#282b824a", boxShadow: '#4f52b2 0px 0px 5px 1px', height: "auto", borderRadius: "3%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 10, backdropFilter: 'blur(15px)' }}>


        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/logo.png" alt="logo" style={{ width: 200, height: 200 }} />
        </span>


        <div>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: "white" }}>Nunca fue tan fácil</Typography>
          <Typography variant="h6" sx={{ marginBottom: '30px', fontWeight: 'bold', color: "white" }}>¡Simplifica la gestión de tu gimnasio!</Typography>
        </div>


        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {!acceptedTerms && (
            <Checkbox
              checked={acceptedTerms}
              onChange={handleTermsChange}
              sx={{ color: 'white', '&.Mui-checked': { color: "#ffd506" } }}
            />
          )}

          <Typography variant="body2" sx={{ color: 'white', fontSize: '14px', marginBottom: "2rem" }}>
            {!acceptedTerms ? "Acepto los " : "Aceptaste los "}
            <Link
              component="button"
              onClick={handleTermsClick}
              sx={{
                color: "#ffd506",
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
                '&:hover': { color: '#e7c107' }
              }}
            >
              Términos y Condiciones
            </Link>
          </Typography>

        </div>


        <GoogleSignIn acceptedTerms={acceptedTerms} />
      </Grid>
    </Grid>
  );
};

export default SignIn;
