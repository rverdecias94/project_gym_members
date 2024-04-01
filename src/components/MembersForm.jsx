/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { Button, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, TextField } from "@mui/material"
import { Box, Checkbox } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useMembers } from '../context/MembersContext';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';

const trainers = [
  {
    value: 'Yansi',
    label: 'Yansi',
  },
  {
    value: 'Mandy',
    label: 'Mandy',
  },
  {
    value: 'Alexis',
    label: 'Alexis',
  },
];


function MembersForm({ member }) {
  const { createNewMember, adding, updateMember } = useMembers();
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



  useEffect(() => {
    console.log(member);
    if (member && Object.keys(member).length > 0) {
      setMemberData(member);
      setEditing(true);
    }
  }, [])




  const handlerSubmit = async (e) => {
    e.preventDefault();
    editing ? updateMember(memberData) : createNewMember(memberData);
    setMemberData({
      first_name: '',
      last_name: '',
      gender: '',
      ci: '',
      address: '',
      has_trainer: false,
      trainer_name: null,
    })
  }

  const handlerChange = (e) => {
    console.log(e.target.name);
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
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '100%' },
          '& .MuiFormControlLabel-root': { m: 1, width: '100%' },
          '& .MuiFormLabel-root': { width: '100%' },
          '& .MuiButton-root': { width: '100%', backgroundColor: "#356dac" },
          padding: 2
        }}
        noValidate
        autoComplete="off"
      >
        <form>
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
          <TextField
            required
            id="outlined-required"
            label="Nombre"
            name="first_name"
            value={memberData?.first_name}
            placeholder='Ej: Jhon'
            onChange={handlerChange}
            size='small'
          />
          <TextField
            required
            id="outlined-required"
            label="Apellidos"
            name="last_name"
            value={memberData?.last_name}
            placeholder='Ej: Doe Smitt'
            onChange={handlerChange}
            size='small'
          />
          <TextField
            required
            id="outlined-required"
            label="CI"
            name="ci"
            value={memberData?.ci}
            placeholder='CI: 35123145685'
            onChange={handlerChange}
            size='small'
          />
          <TextField
            required
            id="outlined-required"
            label="Direccion"
            name="address"
            value={memberData?.address}
            placeholder='S.T Village nº 9827'
            onChange={handlerChange}
            size='small'
          />
          {editing &&
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDatePicker label="Fecha de pago *" defaultValue={dayjs(memberData?.pay_date)} />
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
              label="Mujer" />
            <FormControlLabel
              value="M"
              control={<Radio />}
              label="Hombre" />
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