import { Button, Grid, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { supabase } from "../supabase/client"
import { useNavigate } from "react-router-dom";
import TimerButton from "./TimerButton";
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { provincias } from "./Provincias";
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, MobileTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


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
  schedules: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  },
  monthly_payment: 0,
  daily_payment: 0,
  trainers_cost: 0
}


// eslint-disable-next-line react/prop-types
const GeneralInfo = ({ id }) => {
  console.log(id)
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
    clients: null,
    schedules: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    monthly_payment: 0,
    daily_payment: 0,
    trainers_cost: 0
  })
  const [state, setProvincia] = useState('');
  const [city, setMunicipio] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  const [monthly, setMonthly] = useState(false);
  const [daily, setDaily] = useState(false);


  useEffect(() => {
    const existsUser = () => {
      setTimeout(async () => {
        const { data: members } = await supabase
          .from("members")
          .select()
          .eq("gym_id", id);


        if (!id || id === undefined) return;
        const { data } = await supabase
          .from('info_general_gym')
          .select('owner_id')
          .eq('owner_id', id)

        if (data && data.length > 0 && id !== undefined) {
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

                if (members && members.length === 0)
                  navigate('/bienvenido');
                else
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
      }, 0);
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
    let infoToSave = {
      ...gymInfo,

      monthly_payment: monthly ? gymInfo.monthly_payment : null,
      daily_payment: daily ? gymInfo.daily_payment : null,
    }
    setTimeout(async () => {
      try {
        if (!id) return;
        const result = await supabase
          .from("info_general_gym")
          .update(infoToSave)
          .eq("owner_id", id);
        if (result) {
          navigate('/bienvenido');
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

    if (name === "monthly_payment" && value !== "") {
      if (isNaN(value) || Number(value) <= 0) {
        error = "Pago mensual inválido";
      }
    }

    if (name === "daily_payment" && value !== "") {
      if (isNaN(value) || Number(value) <= 0) {
        error = "Pago diario inválido";
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
      city !== "";

    const paymentsValid = (monthly && !isNaN(gymInfo.monthly_payment) && Number(gymInfo.monthly_payment) > 0) ||
      (daily && !isNaN(gymInfo.daily_payment) && Number(gymInfo.daily_payment) > 0);

    const schedulesValid = Object.values(gymInfo.schedules).some(day => day.length > 0);

    setIsSaveButtonEnabled(noErrors && allFieldsValid && paymentsValid && schedulesValid);
  };




  const handleProvinciaChange = (event) => {
    let { value } = event.target;
    setProvincia(value);
    setGymInfo(prev => ({
      ...prev,
      state: value
    }));
    setMunicipio('');
  };

  const handleMunicipioChange = (event) => {
    let { value } = event.target;
    setMunicipio(value);
    setGymInfo(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleScheduleChange = (dayKey, index, field, value) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const updatedDay = [...newSchedules[dayKey]];
      updatedDay[index] = {
        ...updatedDay[index],
        [field]: value,
      };
      newSchedules[dayKey] = updatedDay;

      return {
        ...prev,
        schedules: newSchedules,
      };
    });
  };


  const addTimeSlot = (dayKey) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const currentSlots = Array.isArray(newSchedules[dayKey]) ? newSchedules[dayKey] : [];
      newSchedules[dayKey] = [...currentSlots, { start: "08:00", end: "09:00" }];

      return {
        ...prev,
        schedules: newSchedules,
      };
    });
  };



  const removeTimeSlot = (dayKey, index) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const updatedDay = [...newSchedules[dayKey]];
      updatedDay.splice(index, 1);
      newSchedules[dayKey] = updatedDay;

      return {
        ...prev,
        schedules: newSchedules,
      };
    });
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
          <Typography variant="h5" style={{ marginBottom: '30px', fontWeight: 'bold', textAlign: "center" }}>
            Usted será regresado al inicio de sesión, por favor contacte con el administrador.
          </Typography>
          <TimerButton setReload={handleReload} timer={"seconds"} />
        </Grid>
      }

      {
        withOutAccount && !userInactive &&
        <Grid item lg={6} xl={6} md={6} sm={6} xs={12}>
          <Typography variant="h5" style={{ marginBottom: '30px', fontWeight: 'bold', textAlign: "center" }}>
            ¡Registro exitoso!
          </Typography>
          <Typography variant="h6" style={{ marginBottom: '30px', textAlign: "center" }}>
            La activación de su solicitud está en curso. Este proceso suele tardar alrededor de 10 minutos, agradecemos su paciencia.
          </Typography>
          <TimerButton setReload={handleReload} timer={"minutes"} />
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

          <FormControl fullWidth margin="normal">
            <Typography variant="h6" style={{ marginTop: 20 }}>
              Tipo de pago
            </Typography>
            <div style={{ display: "flex", gap: 20 }}>
              <label>
                <input type="checkbox" checked={monthly} onChange={() => setMonthly(!monthly)} /> Mensual
              </label>
              <label>
                <input type="checkbox" checked={daily} onChange={() => setDaily(!daily)} /> Diario
              </label>
            </div>
          </FormControl>

          {monthly && (
            <TextField
              required
              label={errors.monthly_payment ? errors.monthly_payment : "Pago mensual"}
              name="monthly_payment"
              value={gymInfo.monthly_payment || ""}
              onChange={handlerChange}
              style={{ width: "100%", marginTop: 20 }}
            />
          )}

          {daily && (
            <TextField
              required
              label={errors.daily_payment ? errors.daily_payment : "Pago diario"}
              name="daily_payment"
              value={gymInfo.daily_payment || ""}
              onChange={handlerChange}
              style={{ width: "100%", marginTop: 20 }}
            />
          )}

          <Typography variant="h6" style={{ marginTop: 30 }}>
            Horarios de funcionamiento
          </Typography>

          {gymInfo?.schedules &&
            [
              { key: "monday", label: "Lunes" },
              { key: "tuesday", label: "Martes" },
              { key: "wednesday", label: "Miércoles" },
              { key: "thursday", label: "Jueves" },
              { key: "friday", label: "Viernes" },
              { key: "saturday", label: "Sábado" },
              { key: "sunday", label: "Domingo" }
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 15, marginTop: 20, display: 'grid', flexDirection: 'column' }}>
                <strong>{label}</strong>
                {Array.isArray(gymInfo.schedules[key]) &&
                  gymInfo.schedules[key].map((slot, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileTimePicker
                          label="Inicio"
                          value={dayjs(slot.start, 'HH:mm')}
                          onChange={(newValue) => {
                            const formatted = dayjs(newValue).format("HH:mm");
                            handleScheduleChange(key, idx, "start", formatted);
                          }}
                          ampm={false}
                          touchUi
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileTimePicker
                          label="Fin"
                          value={dayjs(slot.end, 'HH:mm')}
                          onChange={(newValue) => {
                            const formatted = dayjs(newValue).format("HH:mm");
                            handleScheduleChange(key, idx, "end", formatted);
                          }}
                          ampm={false}
                          touchUi
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <Button onClick={() => removeTimeSlot(key, idx)} color="error" size="small">Eliminar</Button>
                    </div>
                  ))}
                <Button variant="contained" onClick={() => addTimeSlot(key)} size="small" sx={{ mt: 1, width: "fit-content" }}>
                  + Añadir horario
                </Button>
                <hr style={{
                  marginTop: 20,
                  color: "#ccc",
                  borderTop: "1px solid #ccc"
                }} />
              </div>
            ))
          }

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