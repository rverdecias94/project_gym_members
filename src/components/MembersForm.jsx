/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { Button, FormControlLabel, FormLabel, Grid, MenuItem, Radio, RadioGroup, TextField } from "@mui/material"
import { Box, Checkbox } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useMembers } from '../context/Context';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import ImageUploader from './ImageUploader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';

function MembersForm({ member, onClose }) {
  const { createNewMember, adding, updateMember, trainersList } = useMembers();
  const [memberData, setMemberData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    ci: '',
    address: '',
    phone: '',
    has_trainer: false,
    trainer_name: null,
  })
  const [editing, setEditing] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [sendInfo, setSendInfo] = useState(false);

  useEffect(() => {
    if (member && Object.keys(member).length > 0) {
      setMemberData(member);
      setImageBase64(member?.image_profile ?? null)
      setEditing(true);
    }
  }, [])

  useEffect(() => {
    if (memberData.first_name !== ''
      && memberData.last_name !== ''
      && memberData.gender !== ''
      && memberData.ci !== ''
      && memberData.address !== ''
    ) {
      setSendInfo(true);
    }
  }, [memberData])

  useEffect(() => {
    setSendInfo(adding);
  }, [adding])

  useEffect(() => {
    if (trainersList?.length > 0) {
      const trainers = [];
      trainersList.forEach(element => {
        trainers.push({ value: element.name, label: element.name });
      });
      setTrainers(trainers);
    }
  }, [])

  const handlerSubmit = async (e) => {
    e.preventDefault();
    let member = { ...memberData }

    member.image_profile = imageBase64;
    editing ? await updateMember(member) : await createNewMember(member);
    setMemberData({
      first_name: '',
      last_name: '',
      gender: '',
      ci: '',
      address: '',
      phone: '',
      has_trainer: false,
      trainer_name: null,
    })
    setImageBase64(null)
    if (editing) {
      onClose();
    }
  }

  const handlerChange = (e) => {
    setMemberData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'has_trainer' || e.target.name === 'active' ? e.target.checked : e.target.value
    }))

    if (e.target.name === 'has_trainer' && !e.target.checked) {
      setMemberData(prev => ({
        ...prev,
        trainer_name: null
      }))
    }
  }

  const handlerDatePaymentChange = (e) => {

    const fechaActual = new Date(e.$d);
    fechaActual.setMonth(fechaActual.getMonth() + 1);

    if (fechaActual.getMonth() === 0) {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }

    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();
    let new_payment_date = `${año}-${mes}-${dia}`;
    setMemberData(prev => ({
      ...prev,
      pay_date: new_payment_date
    }))
  };


  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '100%', padding: .5 },
          '& .MuiMobileDatePicker-root': { m: 1, width: '100%' },
          '& .MuiFormControlLabel-root': { m: 1, width: '100%' },
          '& .MuiFormLabel-root': { width: '100%' },
          '& .MuiButton-root': { width: 'fit-context', backgroundColor: "#356dac", float: "right" },
          '& .MuiRadioGroup-root': { display: 'flex' },
          '& .MuiIconButton-root': { padding: "0px 0px 15px !important", color: "#f00" },
          padding: editing ? null : 2,
          width: editing ? null : "100vw"
        }}
        noValidate
        autoComplete="off"
      >
        {!editing &&
          <IconButton aria-label="back" size="large">
            <Link to='/clientes'>
              <ArrowBackIcon />
            </Link>
          </IconButton>
        }
        <form style={{ width: "100%", paddingRight: "1rem" }}>
          <Grid container>
            <Grid item lg={4} xl={4} md={4} sm={12} xs={12}>
              <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
              {editing &&
                <Grid container>
                  <Grid item lg={4} xl={4} md={4} sm={12} xs={12}>
                    <FormControlLabel
                      value={memberData?.active}
                      onChange={handlerChange}
                      control={
                        <Checkbox
                          name='active'
                          checked={memberData?.active}
                        />}
                      label="Cliente Activo"
                    />
                  </Grid>
                </Grid>
              }
            </Grid>

            <Grid item lg={8} xl={8} md={8} sm={12} xs={12}
              style={{ marginTop: "2.3rem" }}>
              {/* Fila 1 */}
              <Grid container style={{ display: "flex" }}>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
                    id="outlined-required"
                    label="Nombre"
                    name="first_name"
                    value={memberData?.first_name}
                    placeholder='Ej: Jhon'
                    onChange={handlerChange}
                  />
                </Grid>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
                    id="outlined-required"
                    label="Apellidos"
                    name="last_name"
                    value={memberData?.last_name}
                    placeholder='Ej: Doe Smitt'
                    onChange={handlerChange}
                  />
                </Grid>
              </Grid>
              {/* Fila 2 */}
              <Grid container>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
                    id="outlined-required"
                    label="CI"
                    name="ci"
                    value={memberData?.ci}
                    placeholder='CI: 35123145685'
                    onChange={handlerChange}
                  />
                </Grid>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
                    id="outlined-required"
                    label="Direccion"
                    name="address"
                    value={memberData?.address}
                    placeholder='S.T Village nº 9827'
                    onChange={handlerChange}
                  />
                </Grid>
              </Grid>

              {/* FIla 3 */}
              <Grid container>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <FormControlLabel
                    value={memberData?.has_trainer}
                    onChange={handlerChange}
                    control={
                      <Checkbox
                        name='has_trainer'
                        checked={memberData?.has_trainer}
                      />}
                    label="Solicita entrenador"
                  />
                </Grid>

                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <FormLabel id="demo-row-radio-buttons-group-label">Género</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name='gender'
                    onChange={handlerChange}
                    value={memberData?.gender}
                  >
                    <FormControlLabel
                      value="F"
                      control={<Radio />}
                      label="Femenino"
                      style={{ width: "fit-content" }}
                    />
                    <FormControlLabel
                      value="M"
                      control={<Radio />}
                      label="Masculino"
                      style={{ width: "fit-content" }}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>

              {/* FILA 4 */}
              <Grid container>
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    id="outlined-select-currency"
                    select
                    disabled={!memberData?.has_trainer}
                    label="Entrenador"
                    defaultValue=""
                    placeholder="Selecciona entrenador"
                    name="trainer_name"
                    onChange={handlerChange}
                    value={memberData?.trainer_name}
                  >
                    {trainers.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* FILA 5 */}
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
                    disabled={!memberData?.has_trainer}
                    id="outlined-required"
                    label="Tel. Cliente"
                    name="phone"
                    value={memberData?.phone}
                    placeholder='55565758'
                    onChange={handlerChange}
                  />
                </Grid>
              </Grid>

              {editing &&
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileDatePicker
                    label="Fecha de pago *"
                    defaultValue={dayjs(memberData?.pay_date)}
                    onChange={handlerDatePaymentChange}
                  />
                </LocalizationProvider>
              }
            </Grid>
          </Grid>
        </form>
        <Button
          onClick={handlerSubmit}
          variant="contained"
          color={sendInfo ? 'primary' : 'inherit'}
          disabled={!sendInfo}
          style={{ margin: ".9rem" }}
        >
          {adding ? "Guardando..." : "Guardar"}
        </Button>
      </Box >
    </>
  )
}

export default MembersForm