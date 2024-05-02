/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, TextField } from '@mui/material';



export default function ViewDetails({
  handleClose, open, profile }) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth={"md"}
      >
        <DialogTitle id="alert-dialog-title">
          {"Perfil"}
        </DialogTitle>
        <DialogContent>
          <Grid container sx={{ mt: 3 }}>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Nombre"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.first_name ? profile.first_name : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Apellidos"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.last_name ? profile.last_name : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="CI"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.ci ? profile.ci : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Dirección"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.address ? profile.address : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Teléfono"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.phone !== null ? profile.phone : "Sin Teléfono"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Fecha de pago"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.pay_date ? profile.pay_date : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
              <TextField
                id="outlined-read-only-input"
                label="Entrenador"
                defaultValue="-"
                sx={{ mb: 3, width: "98%" }}
                value={profile?.trainer_name ? profile.trainer_name : "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}