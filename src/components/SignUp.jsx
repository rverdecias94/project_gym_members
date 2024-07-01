import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Button, Grid, TextField, Typography } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState("password");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      handlerClearStates();
      toast.success("¡Registro exitoso!", { duration: 3000 });
      navigate('/login');
    } catch (error) {
      toast.error("No hemos podido registrar el usuario", { duration: 5000 });
      console.error(error);
    }
  };

  function handlerClearStates() {
    setEmail("");
    setPassword("");
  }

  return (
    <Grid container>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Typography variant="h5" textAlign='center' className="login_title">
        ¡Regístrate!
      </Typography>

      <Grid container style={{ display: "flex", justifyContent: "center" }}>
        <Grid item lg={4} xl={4} md={4} sm={6} xs={12}>
          <form onSubmit={handleSignup} className="login_form">
            <TextField
              required
              id="outlined-required"
              label='Correo'
              value={email}
              name="email"
              placeholder="correo@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              inputProps={{ style: { color: "black" } }}
              InputLabelProps={{ style: { color: "#356dac" } }}
              sx={{ marginTop: 15 }}
            />
            <Grid style={{ width: "100%", position: "relative" }}>
              <TextField
                required
                id="outlined-required"
                label='Contraseña'
                type={passwordType}
                value={password}
                name="first_name"
                placeholder="dzie94"
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                inputProps={{ style: { color: "black" } }}
                InputLabelProps={{ style: { color: "#356dac" } }}
                sx={{ marginTop: 3 }}
              />
              <Button
                onClick={() => setPasswordType(passwordType === "password" ? "text" : "password")}
                style={{ position: "absolute", right: "0", top: "2rem", background: "transparent" }}
              >
                {passwordType === "password" ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
              </Button>
            </Grid>

            <Button
              variant="contained"
              style={{ width: "100%", backgroundColor: "#356dac", color: "#fff", fontWeight: "bolder", marginTop: 20 }}
              type="submit">
              Registrarme
            </Button>
            <Grid lg={4} xl={12} md={4} sm={6} xs={12} style={{ width: "100%", marginTop: 10 }}>
              <Link to='/login' style={{ textDecoration: "none", fontFamily: "math" }}>
                !Ya tengo cuenta¡
              </Link>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Signup;
