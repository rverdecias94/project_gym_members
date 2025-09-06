import { Button, Grid, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { supabase } from "../supabase/client"
import { useLocation, useNavigate } from "react-router-dom";
import TimerButton from "./TimerButton";
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { provincias } from "./Provincias";
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, MobileTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSnackbar } from "../context/Snackbar";


const nextPaymentDate = new Date();
nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

const GYM_DEFAULT = {
  owner_id: null,
  gym_name: "DEFAULT_GYM_NAME",
  address: "DEFAULT_ADDRESS",
  owner_name: "DEFAULT_OWNER_NAME",
  owner_phone: "DEFAULT_OWNER_PHONE",
  public_phone: "DEFAULT_PUBLIC_PHONE",
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
  store: null,
  monthly_payment: 0,
  daily_payment: 0,
  trainers_cost: 0,
  monthly_currency: "CUP",
  daily_currency: "CUP"
}


// eslint-disable-next-line react/prop-types
const GeneralInfo = ({ id, step, setIsSaveButtonEnabled, clickOnSave }) => {
  const location = useLocation();
  const { planId } = location.state || {};
  const theme = useTheme();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [userInactive, setUserInactive] = useState(null);
  const [reload, setReload] = useState(false);
  const [createProfile, setCreateProfile] = useState(null);
  const [withOutAccount, setWithOutAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gymInfo, setGymInfo] = useState({
    gym_name: "",
    address: "",
    owner_name: "",
    owner_phone: "",
    public_phone: "",
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
    trainers_cost: 0,
    monthly_currency: "CUP",
    daily_currency: "CUP",
    trainer_currency: "CUP"
  })
  const [state, setProvincia] = useState('');
  const [city, setMunicipio] = useState('');
  const [errors, setErrors] = useState({});
  /* const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false); */

  const [monthly, setMonthly] = useState(false);
  const [daily, setDaily] = useState(false);
  const [trainer, setTrainer] = useState(false);


  useEffect(() => {
    const existsUser = () => {
      setLoading(true);
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
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');

            const todayStr = `${yyyy}-${mm}-${dd}`;
            const nextPaymentStr = data[0].next_payment_date;

            if (nextPaymentStr <= todayStr) {
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
        setLoading(false);
      }, 0);
    }

    const saveUser = () => {
      setTimeout(async () => {
        GYM_DEFAULT.owner_id = id;
        GYM_DEFAULT.store = planId === "premium" ? true : false;
        const { data } = await supabase
          .from('info_general_gym')
          .insert(GYM_DEFAULT);
        if (data)
          existsUser()
      }, 1000)
    };

    existsUser();
  }, [id, reload, planId]);



  useEffect(() => {
    checkFormValidity();
  }, [gymInfo])

  useEffect(() => {
    if (clickOnSave)
      saveGymInfo();
  }, [clickOnSave])


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
        showMessage("Error al guardar la información. Intente nuevamente o contacte al administrador", "error");
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
      if (!/\d{8}$/.test(value)) {
        error = "Teléfono inválido";
      }
    }

    if (name === "public_phone") {
      if (!/\d{8}$/.test(value)) {
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

    if (name === "trainers_cost" && value !== "") {
      if (isNaN(value) || Number(value) <= 0) {
        error = "Pago de entrenador inválido";
      }
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const checkFormValidity = () => {
    const { gym_name, address, owner_name, owner_phone, public_phone, state, city, daily_payment, monthly_payment, } = gymInfo;
    const noErrors = !Object.values(errors).some(error => error);
    const allFieldsValid =
      gym_name.trim().length >= 3 &&
      address.trim().length >= 3 &&
      owner_name.trim().length >= 3 &&
      !/\d/.test(owner_name) &&
      /\d{8}$/.test(owner_phone) &&
      /\d{8}$/.test(public_phone) &&
      state !== "" &&
      city !== "" &&
      (monthly_payment || daily_payment);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Grid container
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: "2rem",
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

        <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
          {step === 0 &&
            <Grid tem lg={12} xl={12} md={12} sm={12} xs={12}>

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
                label={errors.owner_phone ? errors.owner_phone : "Teléfono operacional"}
                name="owner_phone"
                value={gymInfo.owner_phone}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />
              <p style={{ marginTop: 10, color: "#999" }}>Nota: Usaremos este número para mantener la comunicación de operaciones entre tu gimnasio y Tronoss.</p>
              <TextField
                required
                id="outlined-required"
                label={errors.public_phone ? errors.public_phone : "Teléfono de contacto (opcional)"}
                name="public_phone"
                value={gymInfo.public_phone}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />
              <p style={{ marginTop: 10, color: "#999" }}>Nota: Este teléfono se mostrará al público para que puedan comunicarse con ustedes y recibir apoyo o aclarar dudas.</p>
            </Grid>
          }


          {step === 1 &&
            <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
              <>
                <div style={{ display: "flex", width: "100%", justifyContent: "center", gap: 20 }}>
                  <label>
                    <input type="checkbox" checked={monthly} onChange={() => setMonthly(!monthly)} /> Mensual
                  </label>
                  <label>
                    <input type="checkbox" checked={daily} onChange={() => setDaily(!daily)} /> Diario
                  </label>
                  <label>
                    <input type="checkbox" checked={trainer} onChange={() => setTrainer(!trainer)} /> Entrenador
                  </label>
                </div>
              </>

              {monthly && (
                <Grid style={{ display: "flex", gap: 20, justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <TextField
                    required
                    label={errors.monthly_payment ? errors.monthly_payment : "Pago mensual"}
                    name="monthly_payment"
                    value={gymInfo.monthly_payment || ""}
                    onChange={handlerChange}
                    style={{ width: "100%", marginTop: 20 }}
                  />

                  <FormControl required fullWidth margin="normal" id="mun-required">
                    <InputLabel>Moneda</InputLabel>
                    <Select
                      value={gymInfo.monthly_currency}
                      onChange={handlerChange}
                      style={{ width: "100%", marginTop: 10 }}
                      name="monthly_currency"
                    >
                      {(["USD", "CUP"]).map((mun) => (
                        <MenuItem key={mun} value={mun}>
                          {mun}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                </Grid>
              )}

              {daily && (

                <Grid style={{ display: "flex", width: "100%", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                  <TextField
                    required
                    label={errors.daily_payment ? errors.daily_payment : "Pago diario"}
                    name="daily_payment"
                    value={gymInfo.daily_payment || ""}
                    onChange={handlerChange}
                    style={{ width: "100%", marginTop: 20 }}
                  />

                  <FormControl required fullWidth margin="normal" id="mun-required">
                    <InputLabel>Moneda</InputLabel>
                    <Select
                      value={gymInfo.daily_currency}
                      onChange={handlerChange}
                      style={{ width: "100%", marginTop: 10 }}
                      name="daily_currency"
                    >
                      {(["USD", "CUP"]).map((mun) => (
                        <MenuItem key={mun} value={mun}>
                          {mun}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {trainer && (

                <Grid style={{ display: "flex", width: "100%", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                  <TextField
                    required
                    label={errors.trainers_cost ? errors.trainers_cost : "Costo por entrenador"}
                    name="trainers_cost"
                    value={gymInfo.trainers_cost || ""}
                    onChange={handlerChange}
                    style={{ width: "100%", marginTop: 20 }}
                  />

                  <FormControl required fullWidth margin="normal" id="mun-required">
                    <InputLabel>Moneda</InputLabel>
                    <Select
                      value={gymInfo.trainer_currency}
                      onChange={handlerChange}
                      style={{ width: "100%", marginTop: 10 }}
                      name="trainer_currency"
                    >
                      {(["USD", "CUP"]).map((mun) => (
                        <MenuItem key={mun} value={mun}>
                          {mun}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          }

          {step === 2 &&
            <Grid>

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
            </Grid>
          }

        </Grid>
      }
    </Grid>
  )


}

export default GeneralInfo

