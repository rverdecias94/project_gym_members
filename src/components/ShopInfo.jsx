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
import { useMembers } from "../context/Context";

const nextPaymentDate = new Date();
nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

const SHOP_DEFAULT = {
  owner_id: null,
  shop_name: "DEFAULT_SHOP_NAME",
  address: "DEFAULT_ADDRESS",
  owner_name: "DEFAULT_OWNER_NAME",
  owner_phone: "DEFAULT_OWNER_PHONE",
  public_phone: "DEFAULT_PUBLIC_PHONE",
  next_payment_date: nextPaymentDate,
  active: null,
  state: "DEFAULT_STATE",
  city: "DEFAULT_CITY",
  schedules: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  },
  theme: true,
  image_profile: null
}

// eslint-disable-next-line react/prop-types
const ShopInfo = ({ id, step, setIsSaveButtonEnabled, clickOnSave, setIsLoading }) => {
  const location = useLocation();
  const { planId } = location.state || {};
  const theme = useTheme();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const { setShopInfo } = useMembers();
  const [userInactive, setUserInactive] = useState(null);
  const [reload, setReload] = useState(false);
  const [createProfile, setCreateProfile] = useState(null);
  const [withOutAccount, setWithOutAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopInfo, setShopInfoState] = useState({
    shop_name: "",
    address: "",
    owner_name: "",
    owner_phone: "",
    public_phone: "",
    state: "",
    city: "",
    schedules: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  })
  const [state, setProvincia] = useState('');
  const [city, setMunicipio] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const existsUser = () => {
      setLoading(true);
      if (setIsLoading) setIsLoading(true);
      setTimeout(async () => {
        if (!id || id === undefined) return;
        const { data } = await supabase
          .from('info_shops')
          .select('owner_id')
          .eq('owner_id', id)

        if (data && data.length > 0 && id !== undefined) {
          // Buscar el usuario en la tabla de tiendas
          const { data } = await supabase
            .from('info_shops')
            .select()
            .eq('owner_id', id)

          if (data && data.length > 0) {
            setShopInfo(data[0]);
            setShopInfoState(data[0]);

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
                navigate("/tienda");
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
        if (setIsLoading) setIsLoading(false);
      }, 0);
    }

    const saveUser = async () => {
      if (!id) return;
      try {
        const { error } = await supabase
          .from('info_shops')
          .insert([{ ...SHOP_DEFAULT, owner_id: id }])

        if (error) {
          console.error("Error al guardar usuario:", error);
          showMessage("Error al guardar la información. Intente nuevamente o contacte al administrador", "error");
        }
      } catch (error) {
        console.error("Error al guardar usuario:", error);
        showMessage("Error al guardar la información. Intente nuevamente o contacte al administrador", "error");
      }
    }

    existsUser();
  }, [id, reload, planId]);

  useEffect(() => {
    checkFormValidity();
  }, [shopInfo])

  useEffect(() => {
    if (clickOnSave)
      saveShopInfo();
  }, [clickOnSave])

  const handlerChange = (e) => {
    let { name, value } = e.target
    setShopInfoState(prev => ({
      ...prev,
      [name]: value
    }));

    validateFields(name, value);
  };

  const validateFields = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case 'shop_name':
        if (value.trim().length < 3) {
          newErrors.shop_name = 'El nombre debe tener al menos 3 caracteres';
        } else {
          delete newErrors.shop_name;
        }
        break;
      case 'address':
        if (value.trim().length < 3) {
          newErrors.address = 'La dirección debe tener al menos 3 caracteres';
        } else {
          delete newErrors.address;
        }
        break;
      case 'owner_name':
        if (value.trim().length < 3) {
          newErrors.owner_name = 'El nombre debe tener al menos 3 caracteres';
        } else if (/\d/.test(value)) {
          newErrors.owner_name = 'El nombre no debe contener números';
        } else {
          delete newErrors.owner_name;
        }
        break;
      case 'owner_phone':
        if (!/\d{8}$/.test(value)) {
          newErrors.owner_phone = 'El teléfono debe tener 8 dígitos';
        } else {
          delete newErrors.owner_phone;
        }
        break;
      case 'public_phone':
        if (value && !/\d{8}$/.test(value)) {
          newErrors.public_phone = 'El teléfono debe tener 8 dígitos';
        } else {
          delete newErrors.public_phone;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleReload = () => {
    setReload(true);
    setWithOutAccount(false)
  }

  const saveShopInfo = () => {
    let infoToSave = {
      ...shopInfo
    }
    setTimeout(async () => {
      try {
        if (!id) return;
        const result = await supabase
          .from("info_shops")
          .update(infoToSave)
          .eq("owner_id", id);

        if (result) {
          navigate('/tienda');
        }
      } catch (error) {
        showMessage("Error al guardar la información. Intente nuevamente o contacte al administrador", "error");
        console.error(error)
      }
    }, 1000);
  }

  const checkFormValidity = () => {
    const { shop_name, address, owner_name, owner_phone, public_phone, state, city } = shopInfo;
    const noErrors = !Object.values(errors).some(error => error);
    const allFieldsValid =
      shop_name?.trim().length >= 3 &&
      address?.trim().length >= 3 &&
      owner_name?.trim().length >= 3 &&
      !/\d/.test(owner_name) &&
      /\d{8}$/.test(owner_phone) &&
      /\d{8}$/.test(public_phone) &&
      state !== "" &&
      city !== "";

    const schedulesValid = Object.values(shopInfo.schedules).some(day => day.length > 0);

    setIsSaveButtonEnabled(noErrors && allFieldsValid && schedulesValid);
  };

  const handleProvinciaChange = (event) => {
    let { value } = event.target;
    setProvincia(value);
    setShopInfoState(prev => ({
      ...prev,
      state: value
    }));
    setMunicipio('');
  };

  const handleMunicipioChange = (event) => {
    let { value } = event.target;
    setMunicipio(value);
    setShopInfoState(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleScheduleChange = (dayKey, index, field, value) => {
    setShopInfoState(prev => {
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
    setShopInfoState(prev => {
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
    setShopInfoState(prev => {
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
                label={errors.shop_name ? errors.shop_name : "Nombre de la Tienda"}
                name="shop_name"
                value={shopInfo.shop_name}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />

              <TextField
                required
                id="outlined-required"
                label={errors.address ? errors.address : "Dirección"}
                name="address"
                value={shopInfo.address}
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

              <FormControl required fullWidth margin="normal" id="mun-required">
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
                value={shopInfo.owner_name}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />

              <TextField
                required
                id="outlined-required"
                label={errors.owner_phone ? errors.owner_phone : "Teléfono operacional"}
                name="owner_phone"
                value={shopInfo.owner_phone}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />
              <p style={{ marginTop: 10, color: "#999" }}>Nota: Usaremos este número para mantener la comunicación de operaciones entre tu tienda y Tronoss.</p>
              <TextField
                required
                id="outlined-required"
                label={errors.public_phone ? errors.public_phone : "Teléfono de contacto (opcional)"}
                name="public_phone"
                value={shopInfo.public_phone}
                onChange={handlerChange}
                style={{ width: "100%", marginTop: 20 }}
              />
              <p style={{ marginTop: 10, color: "#999" }}>Nota: Este teléfono se mostrará al público para que puedan comunicarse con ustedes y recibir apoyo o aclarar dudas.</p>
            </Grid>
          }

          {step === 1 &&
            <Grid>
              {shopInfo?.schedules &&
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
                    {Array.isArray(shopInfo.schedules[key]) &&
                      shopInfo.schedules[key].map((slot, idx) => (
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

export default ShopInfo