/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { Button, TextField } from "@mui/material";
import { Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useMembers } from '../context/Context';
import { useEffect } from 'react';
import ImageUploader from './ImageUploader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';

function TrainersForm({ trainer, onClose }) {
  const { createNewTrainer, adding, updateTrainer } = useMembers();
  const [trainerData, setTrainerData] = useState({
    name: '',
    last_name: '',
    ci: '',
  })
  const [editing, setEditing] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);


  useEffect(() => {
    if (trainer && Object.keys(trainer).length > 0) {
      setTrainerData(trainer);
      setImageBase64(trainer?.image_profile ?? null)
      setEditing(true);
    }
  }, [])

  const handlerSubmit = async (e) => {
    e.preventDefault();
    let trainer = { ...trainerData }

    trainer.image_profile = imageBase64;
    console.log(trainer)
    editing ? await updateTrainer(trainer) : await createNewTrainer(trainer);
    setTrainerData({
      name: '',
      last_name: '',
      ci: '',
    })
    setImageBase64(null)
    if (editing) {
      onClose();
    }
  }

  const handlerChange = (e) => {
    setTrainerData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
          <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
          <TextField
            required
            id="outlined-required"
            label="Nombre"
            name="name"
            value={trainerData?.name}
            placeholder='Ej: Jhon'
            onChange={handlerChange}
          />
          <TextField
            required
            id="outlined-required"
            label="Apellidos"
            name="last_name"
            value={trainerData?.last_name}
            placeholder='Ej: Doe Smitt'
            onChange={handlerChange}
          />
          <TextField
            required
            id="outlined-required"
            label="CI"
            name="ci"
            value={trainerData?.ci}
            placeholder='CI: 35123145685'
            onChange={handlerChange}
          />

          <Button disabled={adding} onClick={handlerSubmit} variant="contained">
            {adding ? "Guardando..." : "Guardar"}
          </Button>

        </form>
      </Box>
    </>
  )
}

export default TrainersForm