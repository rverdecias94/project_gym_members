import { Button, Grid, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { supabase } from "../supabase/client"
import { useNavigate } from "react-router-dom";
import TimerButton from "./TimerButton";
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { provincias } from "./Provincias";
import { useTheme } from '@mui/material/styles';


const nextPaymentDate = new Date();
nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

const GYM_DEFAULT = {
  owner_id: null,
  gym_name: "DEFAULT_GYM_NAME",
  address: "DEFAULT_ADDRESS",
  owner_name: "DEFAULT_OWNER_NAME",
  owner_phone: "DEFAULT_OWNER_PHONE",
  next_payment_date: nextPaymentDate,
  last_payment_date: new Date(),
  active: null,
  state: "DEFAULT_STATE",
  city: "DEFAULT_CITY",
  clients: 0,
}


// eslint-disable-next-line react/prop-types
const GeneralInfo = ({ id }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userInactive, setUserInactive] = useState(null);
  const [reload, setReload] = useState(false);
  const [createProfile, setCreateProfile] = useState(null);
  const [withOutAccount, setWithOutAccount] = useState(null);
  const [gymInfo, setGymInfo] = useState({
    gym_name: "",
    address: "",
    owner_name: "",
    owner_phone: "",
    state: "",
    city: "",
    clients: "",
  })
  const [state, setProvincia] = useState('');
  const [city, setMunicipio] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  useEffect(() => {
    const existsUser = async () => {
      const { data } = await supabase
        .from('info_general_gym')
        .select('owner_id')
        .eq('owner_id', id)

      if (data && data.length > 0) {
        // Buscar el usuario en la tabla de gimnasios
        const { data } = await supabase
          .from('info_general_gym')
          .select()
          .eq('owner_id', id)

        if (data && data.length > 0) {
          const nextPaymentDate = new Date(data[0].next_payment_date);
          const today = new Date();

          if (nextPaymentDate < today) {
            setUserInactive(true);
          }
          else if (data[0].active === true) {
            const containsDefault = Object.values(data[0]).some(value =>
              typeof value === 'string' && value.includes("DEFAULT_")
            );
            if (containsDefault) {
              setCreateProfile(true);
            } else {
              navigate("/panel");
            }
          } else if (data[0].active === false) {
            setUserInactive(true);
          } else {
            setWithOutAccount(true);
          }
        }
      } else {
        saveUser();
        setWithOutAccount(true);
      }
    }

    const saveUser = () => {
      setTimeout(async () => {
        GYM_DEFAULT.owner_id = id;
        const { data } = await supabase
          .from('info_general_gym')
          .insert(GYM_DEFAULT);
        if (data)
          existsUser()
      }, 1000)
    };

    existsUser();
  }, [id, reload])



  useEffect(() => {
    checkFormValidity();
  }, [gymInfo])


  const handlerChange = (e) => {
    let { name, value } = e.target
    setGymInfo(prev => ({
      ...prev,
      [name]: value
    }));

    validateFields(name, value);
  };

  const handleReload = () => {
    setReload(true);
    setWithOutAccount(false)
  }

  const saveGymInfo = () => {
    let infoToSave = { ...gymInfo }
    setTimeout(async () => {
      try {
        const result = await supabase
          .from("info_general_gym")
          .update(infoToSave)
          .eq("owner_id", id);

        if (result) {
          navigate('/panel');
        }
      } catch (error) {
        console.error(error)
      }
    }, 1000);
  }

  const validateFields = (name, value) => {
    let error = "";

    if (name === "gym_name") {
      if (value.trim().length < 3) {
        error = "Nomb. de gimnasio inválido";
      }
    }
    if (name === "address") {
      if (value.trim().length < 3) {
        error = "Dirección inválida";
      }
    }

    if (name === "owner_name") {
      if (value.trim().length < 3 || /\d/.test(value)) {
        error = "Nombre inválido";
      }
    }

    if (name === "owner_phone") {
      if (!/^[5]\d{7}$/.test(value)) {
        error = "Teléfono inválido";
      }
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const checkFormValidity = () => {
    const { gym_name, address, owner_name, owner_phone, state, city } = gymInfo;
    const noErrors = !Object.values(errors).some(error => error);
    const allFieldsValid =
      gym_name.trim().length >= 3 &&
      address.trim().length >= 3 &&
      owner_name.trim().length >= 3 &&
      !/\d/.test(owner_name) &&
      /^[5]\d{7}$/.test(owner_phone) &&
      state !== "" &&
      city !== ""
      ;

    setIsSaveButtonEnabled(noErrors && allFieldsValid);
  };



  const handleProvinciaChange = (event) => {
    let { value } = event.target;
    setProvincia(value);
    setGymInfo(prev => ({
      ...prev,
      state: value
    }));
    setMunicipio(''); // Reinicia city cuando cambia state
  };

  const handleMunicipioChange = (event) => {
    let { value } = event.target;
    setMunicipio(value);
    setGymInfo(prev => ({
      ...prev,
      city: value
    }));
  };

  return (
    <Grid container
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        backgroundColor: theme.palette.background.main,
      }}
    >
      {userInactive &&
        <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
          <Typography variant="h5" style={{ marginBottom: '30px', fontWeight: 'bold', textAlign: "center" }}>
            Su cuenta está inactiva temporalmente hasta que sea efectuado el pago mensual del uso de la aplicación.
          </Typography>
        </Grid>
      }

      {
        withOutAccount &&
        <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
          <Typography variant="h5" style={{ marginBottom: '30px', fontWeight: 'bold', textAlign: "center" }}>
            ¡Registro exitoso!
          </Typography>
          <Typography variant="h6" style={{ marginBottom: '30px', textAlign: "center" }}>
            La activación de su solicitud está en curso. Este proceso suele tardar alrededor de 10 minutos, agradecemos su paciencia.
          </Typography>
          <TimerButton setReload={handleReload} />
        </Grid>
      }

      {createProfile &&
        <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
          <Typography variant="h5" style={{ marginBottom: '30px', textAlign: "center" }}>
            Datos generales de la cuenta
          </Typography>
          <TextField
            required
            id="outlined-required"
            label={errors.gym_name ? errors.gym_name : "Nombre de gimnasio"}
            name="gym_name"
            value={gymInfo.gym_name}
            onChange={handlerChange}
            style={{ width: "100%", marginTop: 20 }}
          />

          <br />
          <TextField
            required
            id="outlined-required"
            label={errors.address ? errors.address : "Dirección"}
            name="address"
            value={gymInfo.address}
            onChange={handlerChange}
            style={{ width: "100%", marginTop: 20 }}
          />

          <FormControl required fullWidth margin="normal" id="prov-required">
            <InputLabel>Provincia</InputLabel>
            <Select
              value={state}
              onChange={handleProvinciaChange}
            >
              {Object.keys(provincias).map((prov) => (
                <MenuItem key={prov} value={prov}>
                  {prov}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl required fullWidth margin="normal" disabled={!state} id="mun-required">
            <InputLabel>Municipio</InputLabel>
            <Select
              value={city}
              onChange={handleMunicipioChange}
            >
              {(provincias[state] || []).map((mun) => (
                <MenuItem key={mun} value={mun}>
                  {mun}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            id="outlined-required"
            label={errors.owner_name ? errors.owner_name : "Nombre de Propietario"}
            name="owner_name"
            value={gymInfo.owner_name}
            onChange={handlerChange}
            style={{ width: "100%", marginTop: 20 }}
          />

          <TextField
            required
            id="outlined-required"
            label={errors.owner_phone ? errors.owner_phone : "Teléfono"}
            name="owner_phone"
            value={gymInfo.owner_phone}
            onChange={handlerChange}
            style={{ width: "100%", marginTop: 20 }}
          />

          <Button
            onClick={saveGymInfo}
            color="primary"
            disabled={
              !isSaveButtonEnabled
            }
            variant={"contained"}
            style={{ width: "100%", marginTop: 20 }}>
            Continuar
          </Button>
        </Grid>
      }
    </Grid>
  )
}

export default GeneralInfo