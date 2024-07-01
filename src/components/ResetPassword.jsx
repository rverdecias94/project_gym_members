import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from '../supabase/client';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      toast.success("Te hemos enviado un correo para restablecer tu contraseña!", { duration: 5000 });
    } catch (error) {
      toast.error("No hemos podido enviar el correo de restablecimiento de contraseña", { duration: 5000 });
      console.error(error);
    }
  };

  return (
    <Grid container>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Typography variant="h5" textAlign='center' className="login_title">
        ¡Cambiar Contraseña!
      </Typography>

      <Grid container style={{ display: "flex", justifyContent: "center" }}>
        <Grid item lg={4} xl={4} md={4} sm={6} xs={12}>
          <form onSubmit={handleResetPassword} className="login_form">

            <TextField
              required
              id="outlined-required"
              label='Email'
              value={email}
              name="email"
              placeholder="correo@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              inputProps={{ style: { color: "black" } }}
              InputLabelProps={{ style: { color: "#356dac" } }}
              sx={{ marginTop: 15 }}
            />
            <Button
              variant="contained"
              style={{ width: "100%", backgroundColor: "#356dac", color: "#fff", fontWeight: "bolder", marginTop: 15 }}
              type="submit">
              Cambiar contraseña
            </Button>
            <Link to='/login'>
              Regresar a inicio
            </Link>
          </form>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
