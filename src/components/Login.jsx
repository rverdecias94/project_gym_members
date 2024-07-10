import { Typography, Grid, TextField, Button } from "@mui/material"
import { useState } from "react"
import { supabase } from "../supabase/client";
import { Toaster, toast } from 'react-hot-toast';
import { Link } from "react-router-dom";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useMembers } from "../context/Context";

export default function Login() {

  const { setBackdrop } = useMembers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");

  const handlerSubmit = async (e) => {
    setBackdrop(true);
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBackdrop(false);
      handlerClearStates();
      if (error) throw error;
    } catch (error) {
      toast.error("No hemos podido iniciar sesión. Credenciales incorrectas", { duration: 5000 });
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
        ¡Bienvenido!
      </Typography>

      <Grid container style={{ display: "flex", justifyContent: "center" }}>
        <Grid item lg={4} xl={4} md={4} sm={6} xs={12}>
          <form onSubmit={handlerSubmit} className="login_form">
            <Link to='/sign_up' style={{ textDecoration: "none", fontFamily: "math", margin: "5rem 0", borderRadius: 5, padding: 5, background: "rgba(25, 118, 210, 0.12)", color: "rgb(21, 101, 192)" }} >
              ¿Ya tienes cuenta? Regístrate!
            </Link>
            <TextField
              required
              id="outlined-required"
              label='Correo'
              value={email}
              name="first_name"
              placeholder="correo@compañia.com"
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              inputProps={{ style: { color: "black" } }}
              InputLabelProps={{ style: { color: "#356dac" } }}
            />
            <Grid style={{ width: "100%", position: "relative" }}>
              <TextField
                required
                id="outlined-required"
                label='Contraseña'
                type={passwordType}
                value={password}
                name="first_name"
                placeholder="*******"
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                inputProps={{ style: { color: "black" } }}
                InputLabelProps={{ style: { color: "#356dac" } }}
                sx={{ marginTop: 4 }}
              />
              <Button
                onClick={() => setPasswordType(passwordType === "password" ? "text" : "password")}
                style={{ position: "absolute", right: "0", top: "2.6rem", background: "transparent" }}
              >
                {passwordType === "password" ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
              </Button>
            </Grid>

            <Grid lg={4} xl={12} md={4} sm={6} xs={12} style={{ width: "100%", marginTop: 10 }}>
              <Link to='/reset_password' style={{ fontFamily: "math", color: "#356dac" }}>
                Olvidé mi contraseña
              </Link>
            </Grid>
            <Button
              variant="contained"
              style={{ width: "100%", backgroundColor: "#356dac", color: "#fff", fontWeight: "bolder", marginTop: 15 }}
              type="submit">
              Iniciar Sesión
            </Button>
          </form>
        </Grid>
      </Grid>
    </Grid>
  )
}
