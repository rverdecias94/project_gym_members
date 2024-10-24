/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { Button, Grid, TextField } from "@mui/material";
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
  const [errors, setErrors] = useState({
    name: false,
    last_name: false,
    ci: false,
  });

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
    let { name, value } = e.target;

    let newValue = value;
    let isValid = true;

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

    setTrainerData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: !isValid
    }));
  }
  const isFormValid = () => {
    return (
      !errors?.name &&
      !errors?.last_name &&
      !errors?.ci
    );
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
          '& .MuiTextField-root': { margin: "8px 2.5%", width: '95%' },
          '& .MuiFormControlLabel-root': { m: 1, width: '100%' },
          '& .MuiFormLabel-root': { width: '100%' },
          '& .MuiButton-root': { width: 'fit-context', backgroundColor: "#356dac" },
          '& .MuiRadioGroup-root': { display: 'flex' },
          '& .MuiIconButton-root': { padding: "0px 0px 15px !important", color: "#f00" },
          padding: editing ? null : 2,

        }}
        noValidate
        autoComplete="off"
      >
        {!editing &&
          <IconButton aria-label="back" size="large">
            <Link to='/entrenadores'>
              <ArrowBackIcon />
            </Link>
          </IconButton>
        }
        <form>
          <Grid container>
            <Grid item lg={6} xl={6} md={6} sm={12} xs={12}>
              <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
            </Grid>
            <Grid item lg={6} xl={6} md={6} sm={12} xs={12} style={{ marginTop: "2.5rem" }}>
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
              <Button
                onClick={handlerSubmit}
                variant="contained"
                disabled={!isFormValid()}
                color={isFormValid() ? "primary" : "inherit"}
                style={{ margin: "5px 12px 100px" }}
              >
                {adding ? "Guardando..." : "Guardar"}
              </Button>
            </Grid>
          </Grid>
        </form>

      </Box>
    </>
  )
}

export default TrainersForm