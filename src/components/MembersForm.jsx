import { useState } from 'react'
import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material"
import { Box, Checkbox } from '@mui/material';
/* import { supabase } from "../supabase/client";
import { Toaster, toast } from 'react-hot-toast'; */

function MembersForm() {
  const [memberData, setMemberData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    ci: '',
    address: '',
    has_trainer: false,
  })

  const handlerSubmit = (e) => {
    e.preventDefault()
    let dataToSave = {
      ...memberData,
      pay_date: Date.now(),
    }
    console.log(dataToSave)
    /* try {
      const result = supabase.from("members").insert({
        first_name: dataToSave.first_name,
        last_name: dataToSave.last_name,
        ci: dataToSave.ci,
        address: dataToSave.address,
        has_trainer: dataToSave.has_trainer,
        pay_date: dataToSave.pay_date,
      });
      console.log(result)
      if (result) {
        toast.success("Registro guardado satisfactoriamente")
      }
    } catch (error) {
      console.error(error)
    } */
    setMemberData({
      first_name: '',
      last_name: '',
      gender: '',
      ci: '',
      address: '',
      has_trainer: false,
    })
  }

  const handlerChange = (e) => {
    setMemberData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'has_trainer' ? e.target.checked : e.target.value
    }))
  }
  return (
    <>
      {/* <Toaster
        position="top-center"
        reverseOrder={false}
      /> */}
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
          <FormControlLabel
            value={memberData?.has_trainer}
            onChange={handlerChange}
            control={
              <Checkbox
                name='has_trainer'
              />}
            label="Solicita entrenador"
          />
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

          <Button onClick={handlerSubmit} variant="contained" color="success">
            Guardar
          </Button>

        </form>
      </Box>
    </>
  )
}

export default MembersForm