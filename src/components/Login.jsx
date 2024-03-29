import { Typography, Grid, TextField, Button } from "@mui/material"
import { useState } from "react"
import { supabase } from "../supabase/client";
import { Toaster, toast } from 'react-hot-toast';


export default function Login() {

  const [email, setEmail] = useState();

  const handlerSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signInWithOtp({ email });
      toast.success("Le hemos enviado un link para poder registrarse a su dirección de correo!", { duration: 5000 })
    } catch (error) {
      toast.success("No hemos podido enviar el correo de registro", { duration: 5000 })
      console.error(error);
    }
  };

  const handlerChange = e => {
    e.preventDefault();
    setEmail(e.target.value)
  }

  return (
    <Grid container>
      <Grid xs={8}>

        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <Typography variant="h5" textAlign='center' className="login_title">
          Iniciar sesión con Email
        </Typography>
        <form onSubmit={handlerSubmit} className="login_form">
          <TextField
            required
            id="outlined-required"
            label='Correo'
            value={email}
            name="first_name"
            placeholder="Escribe tu correo aquí ..."
            onChange={handlerChange}
            fullWidth
            size='small'
            inputProps={{ style: { color: "black" } }}
            InputLabelProps={{ style: { color: "#356dac" } }}
          />
          <br />
          <Button variant="contained" style={{ width: "100%", backgroundColor: "#356dac", color: "#fff", fontWeight: "bolder", marginTop: 15 }} type="submit">
            Enviar link
          </Button>
        </form>

      </Grid>
    </Grid>
  )
}
