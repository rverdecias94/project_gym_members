/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { Button, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, TextField } from "@mui/material"
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
    has_trainer: false,
    trainer_name: null,
  })
  const [editing, setEditing] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [trainers, setTrainers] = useState([]);


  useEffect(() => {
    if (member && Object.keys(member).length > 0) {
      setMemberData(member);
      setImageBase64(member?.image_profile ?? null)
      setEditing(true);
    }
  }, [])

  useEffect(() => {
    console.log(trainersList)
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
    console.log(member)
    editing ? await updateMember(member) : await createNewMember(member);
    setMemberData({
      first_name: '',
      last_name: '',
      gender: '',
      ci: '',
      address: '',
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
          '& .MuiTextField-root': { margin: "8px 0", width: '100%' },
          '& .MuiFormControlLabel-root': { m: 1, width: '100%' },
          '& .MuiFormLabel-root': { width: '100%' },
          '& .MuiButton-root': { width: '100%', backgroundColor: "#356dac" },
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
            <Link to='/'>
              <ArrowBackIcon />
            </Link>
          </IconButton>
        }
        <form style={{ width: "100%" }}>
          {editing &&
            <FormControlLabel
              value={memberData?.active}
              onChange={handlerChange}
              control={
                <Checkbox
                  name='active'
                  checked={memberData?.active}
                />}
              label="Miembro Activo"
            />
          }
          <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
          <TextField
            required
            id="outlined-required"
            label="Nombre"
            name="first_name"
            value={memberData?.first_name}
            placeholder='Ej: Jhon'
            onChange={handlerChange}
          />
          <TextField
            required
            id="outlined-required"
            label="Apellidos"
            name="last_name"
            value={memberData?.last_name}
            placeholder='Ej: Doe Smitt'
            onChange={handlerChange}
          />
          <TextField
            required
            id="outlined-required"
            label="CI"
            name="ci"
            value={memberData?.ci}
            placeholder='CI: 35123145685'
            onChange={handlerChange}
          />
          <TextField
            required
            id="outlined-required"
            label="Direccion"
            name="address"
            value={memberData?.address}
            placeholder='S.T Village nº 9827'
            onChange={handlerChange}
          />
          {editing &&
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDatePicker
                label="Fecha de pago *"
                defaultValue={dayjs(memberData?.pay_date)}
                onChange={handlerDatePaymentChange}
              />
            </LocalizationProvider>
          }
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
          {memberData?.has_trainer &&
            <TextField
              id="outlined-select-currency"
              select
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
          }

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

          <Button disabled={adding} onClick={handlerSubmit} variant="contained">
            {adding ? "Guardando..." : "Guardar"}
          </Button>

        </form>
      </Box>
    </>
  )
}

export default MembersForm