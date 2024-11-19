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
  const { createNewMember, adding, updateClient, trainersList } = useMembers();
  const [memberData, setMemberData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    ci: '',
    address: '',
    phone: '',
    has_trainer: false,
    trainer_name: null,
  })
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    ci: false,
    phone: false,
  });

  const [editing, setEditing] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [trainers, setTrainers] = useState([]);
  //const [sendInfo, setSendInfo] = useState(false);

  useEffect(() => {
    if (member && Object.keys(member).length > 0) {
      setMemberData(member);
      setImageBase64(member?.image_profile ?? null)
      setEditing(true);
    }
  }, [])


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

    editing ? await updateClient(member) : await createNewMember(member);
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

  /* const handlerChange = (e) => {
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
  } */

  const handlerChange = (e) => {
    const { name, value, checked, type } = e.target;

    let newValue = type === 'checkbox' ? checked : value;
    let isValid = true;

    // Validaciones
    if (name === 'first_name' || name === 'last_name') {
      isValid = !/\d/.test(value);
      newValue = value.replace(/\d/g, '');
    } else if (name === 'ci') {
      isValid = /^\d{0,11}$/.test(value);
      newValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (name === 'phone') {
      isValid = /^\d{0,8}$/.test(value);
      newValue = value.replace(/\D/g, '').slice(0, 8);
    }

    setMemberData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: !isValid
    }));

    if (name === 'has_trainer' && !checked) {
      setMemberData(prev => ({
        ...prev,
        trainer_name: null
      }));
    }
  };

  const isFormValid = () => {
    if (memberData.has_trainer) {
      return (
        !errors.first_name && //campo requerido
        !errors.last_name && //campo requerido
        !errors.ci && //campo requerido
        memberData?.address !== '' && //campo requerido
        memberData?.ci?.length === 11 &&
        memberData?.first_name !== '' &&
        memberData?.last_name !== '' &&
        !errors.phone &&
        memberData?.phone?.length === 8 &&
        memberData?.trainer_name !== ''
      );
    }
    return (
      !errors?.first_name && //campo requerido
      !errors?.last_name && //campo requerido
      !errors?.ci && //campo requerido
      memberData?.address !== '' && //campo requerido
      memberData?.phone?.length === 8 && //campo requerido
      memberData?.ci?.length === 11 &&
      memberData?.first_name !== '' &&
      memberData?.last_name !== ''
    );
  };


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
          '& .MuiButton-root': { width: 'fit-context', backgroundColor: "#217b7c", float: "right" },
          '& .MuiRadioGroup-root': { display: 'flex' },
          '& .MuiIconButton-root': { padding: "0px 0px 15px !important", color: "#f00" },
          padding: editing ? null : 2,
          //width: editing ? null : "100vw"
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
                {trainers.length > 0 &&
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
                }

                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <FormLabel style={{ marginLeft: "20px" }} id="demo-row-radio-buttons-group-label">Género</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name='gender'
                    onChange={handlerChange}
                    value={memberData?.gender}
                  >
                    <FormControlLabel
                      value="M"
                      control={<Radio />}
                      label="Masculino"
                      style={{ width: "fit-content" }}
                    />
                    <FormControlLabel
                      value="F"
                      control={<Radio />}
                      label="Femenino"
                      style={{ width: "fit-content" }}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>

              {/* FILA 4 */}
              <Grid container>
                {memberData?.has_trainer &&
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
                }
                <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
                  <TextField
                    required
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
          disabled={!isFormValid()}
          color={isFormValid() ? "primary" : "inherit"}
          style={{ margin: "5px 12px 100px" }}
        >
          {adding ? "Guardando..." : "Guardar"}
        </Button>
      </Box >
    </>
  )
}

export default MembersForm