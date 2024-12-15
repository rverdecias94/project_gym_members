/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, TextField } from '@mui/material';
import { useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { provincias } from "./Provincias";


const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#e49c10',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#6164c7',
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

export default function SettingsAccount({
  handleClose, open, profile }) {

  const [modeDark, setModeDark] = useState(null)
  const [gymInfo, setGymInfo] = useState({
    owner_id: "",
    gym_name: "",
    owner_name: "",
    owner_phone: "",
    address: "",
    state: "",
    city: "",
    next_payment_date: "",
  })
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (gymInfo && gymInfo.next_payment_date !== "") {
      const calculateDays = () => {
        const today = new Date();
        const futureDate = new Date(gymInfo.next_payment_date);
        const timeDifference = futureDate - today;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        setDaysRemaining(daysDifference);
      };

      calculateDays();
    }
  }, [gymInfo]);

  useEffect(() => {
    const existsUser = async () => {
      const { data } = await supabase
        .from('info_general_gym')
        .select()
        .eq('owner_id', profile.id)

      if (data.length > 0) {
        let {
          owner_id,
          gym_name,
          owner_name,
          owner_phone,
          address,
          state,
          city,
          next_payment_date } = data[0];

        let obj = {
          owner_id,
          gym_name,
          owner_name,
          owner_phone,
          address,
          state,
          city,
          next_payment_date
        }
        setGymInfo(obj)
      }

    }

    existsUser();
  }, [open, profile])


  const handleEdit = (key) => {
    setGymInfo(prev => ({ ...prev, [key]: false }))
  }

  const switchStatusChange = () => {
    setModeDark(!modeDark)
  }
  const handleProvinciaChange = (event) => {
    let { value } = event.target;
    setGymInfo(prev => ({
      ...prev,
      state: value,
      city: ""
    })); // Reinicia city cuando cambia state
  };

  const handleMunicipioChange = (event) => {
    let { value } = event.target;
    setGymInfo(prev => ({
      ...prev,
      city: value
    }));
  };

  const saveGymInfo = () => {
    let infoToSave = { ...gymInfo }
    setTimeout(async () => {
      try {
        const result = await supabase
          .from("info_general_gym")
          .update(infoToSave)
          .eq("owner_id", gymInfo.owner_id);

        if (result) {
          handleClose();
        }
      } catch (error) {
        console.error(error)
      }
    }, 1000);
  }
  const handlerChange = (e) => {
    let { name, value } = e.target
    setGymInfo(prev => ({
      ...prev,
      [name]: value
    }));

    /* validateFields(name, value); */
  };


  const handleDownload = () => {
    const fileUrl = `/files/Listado_clientes.xlsx`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'Listado_clientes.xlsx';
    link.click();
  };


  return (

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={"lg"}
    >
      <DialogTitle id="alert-dialog-title">
        {"Configuración de la cuenta"}
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{ mt: 3 }}>
          <Grid item xl={6} lg={6} md={4} sm={4} xs={12}>

            <TextField
              id="outlined-read-only-input"
              label="Nombre de gimnasio"
              defaultValue="-"
              name='gym_name'
              sx={{ mb: 3, width: "98%" }}
              value={gymInfo?.gym_name}
              onChange={handlerChange}
            />

            <TextField
              id="outlined-read-only-input"
              label="Propietario"
              defaultValue="-"
              sx={{ mb: 3, width: "98%" }}
              name='owner_name'
              value={gymInfo?.owner_name}
              onChange={handlerChange}
            />

            <TextField
              id="outlined-read-only-input"
              label="Dirección"
              defaultValue="-"
              sx={{ mb: 3, width: "98%" }}
              name='address'
              value={gymInfo?.address}
              onChange={handlerChange}
            />
            <TextField
              id="outlined-read-only-input"
              label="Teléfono"
              defaultValue="-"
              sx={{ mb: 3, width: "98%" }}
              name='owner_phone'
              value={gymInfo?.owner_phone}
              onChange={handlerChange}
            />
          </Grid>
          <Grid item xl={6} lg={6} md={4} sm={4} xs={12}>
            <TextField
              id="outlined-read-only-input"
              label="Cuenta inactiva en"
              defaultValue="-"
              sx={{ mb: 1, width: "98%" }}
              value={`${daysRemaining} días`}
              disabled={true}
            />
            <FormControl
              required
              fullWidth
              margin="normal"
              id="prov-required"
              sx={{ mb: 1, width: "98%" }}
            >
              <InputLabel>Provincia</InputLabel>
              <Select
                value={gymInfo?.state}
                onChange={handleProvinciaChange}
              >
                {Object.keys(provincias).map((prov) => (
                  <MenuItem key={prov} value={prov}>
                    {prov}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              required
              fullWidth
              margin="normal"
              disabled={!gymInfo?.state}
              id="mun-required"
              sx={{ mb: 3, width: "98%" }}
            >
              <InputLabel>Municipio</InputLabel>
              <Select
                value={gymInfo?.city}
                onChange={handleMunicipioChange}
              >
                {(provincias[gymInfo.state] || []).map((mun) => (
                  <MenuItem key={mun} value={mun}>
                    {mun}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                >
                  Descargar Excel | Clientes
                </Button>
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <span>Tema por defecto</span>
                <CustomSwitch
                  onChange={switchStatusChange}
                  checked={modeDark}
                />
              </Grid>
            </Grid>


          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ marginRight: 4 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="accent"
          onClick={saveGymInfo}
        /* disabled={
          !isSaveButtonEnabled
        } */
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>

  );
}