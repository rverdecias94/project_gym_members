import { Grid, Typography, Checkbox, FormControlLabel, Link } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';

// eslint-disable-next-line react/prop-types
const SignIn = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();


  const handleTermsChange = (event) => {
    setAcceptedTerms(event.target.checked);
  };

  const handleTermsClick = () => {
    navigate(window.open('/terms-conditions', '_blank'));
  };

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
        height: "75vh",
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

        {/* Checkbox de términos y condiciones */}
        <div style={{
          display: "flex !important",
          alignItems: 'center !important'
        }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={handleTermsChange}
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: "#ffd506",
                    display: "flex !important",
                    alignItems: 'center !important'
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: 1.4,

                }}
              >
                Acepto los{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleTermsClick}
                  sx={{
                    color: "#ffd506",
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    '&:hover': {
                      color: '#e7c107',
                    },
                  }}
                >
                  Términos y Condiciones
                </Link>
              </Typography>
            }
            sx={{
              alignItems: 'flex-start',
              marginLeft: 0,
            }}
          />
        </div>

        <GoogleSignIn acceptedTerms={acceptedTerms} />
      </Grid>
    </Grid>
  );
};

export default SignIn;