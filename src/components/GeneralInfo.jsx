import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { provincias } from "./Provincias";
import { useSnackbar } from "../context/Snackbar";
import { useMembers } from "../context/Context";
import { processImage } from "../utils/imageProcessor";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import { Camera, Trash2 } from "lucide-react";

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
  daily_currency: "CUP",
  image_profile: null
};

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
};

// eslint-disable-next-line react/prop-types
const GeneralInfo = ({ id, step, setIsSaveButtonEnabled, clickOnSave, setIsLoading }) => {
  const location = useLocation();
  const { planId } = location.state || {};
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const { setGymInfo: setGymInfoInContext, getAuthUser } = useMembers();
  const [userInactive, setUserInactive] = useState(null);
  const [reload, setReload] = useState(false);
  const [createProfile, setCreateProfile] = useState(null);
  const [withOutAccount, setWithOutAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

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
    trainer_currency: "CUP",
    image_profile: null
  });

  const [state, setProvincia] = useState('');
  const [city, setMunicipio] = useState('');
  const [errors, setErrors] = useState({});
  const [useGeneralSchedule, setUseGeneralSchedule] = useState(false);
  const [generalScheduleType, setGeneralScheduleType] = useState('mon_fri');
  const [customSchedules, setCustomSchedules] = useState(null);
  const [useSamePhone, setUseSamePhone] = useState(false);

  const [monthly, setMonthly] = useState(false);
  const [daily, setDaily] = useState(false);
  const [trainer, setTrainer] = useState(false);

  useEffect(() => {
    const existsUser = () => {
      setLoading(true);
      if (setIsLoading) setIsLoading(true);
      setTimeout(async () => {
        if (!id || id === undefined) {
          setLoading(false);
          if (setIsLoading) setIsLoading(false);
          return;
        }

        const { data: authData } = await getAuthUser();
        if (authData?.user) {
          setUserInfo({
            name: authData.user.user_metadata?.name || '',
            email: authData.user.email || ''
          });
        }

        const { data: members } = await supabase
          .from("members")
          .select()
          .eq("gym_id", id);

        const { data } = await supabase
          .from('info_general_gym')
          .select('owner_id')
          .eq('owner_id', id);

        if (data && data.length > 0 && id !== undefined) {
          const { data: gymData } = await supabase
            .from('info_general_gym')
            .select()
            .eq('owner_id', id);

          if (gymData && gymData.length > 0) {
            setGymInfo(gymData[0]);
            setGymInfoInContext(gymData[0]);
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');

            const todayStr = `${yyyy}-${mm}-${dd}`;
            const nextPaymentStr = gymData[0].next_payment_date;

            if (nextPaymentStr <= todayStr) {
              setUserInactive(true);
            } else if (gymData[0].active === true) {
              const containsDefault = Object.values(gymData[0]).some(value =>
                typeof value === 'string' && value.includes("DEFAULT_")
              );
              if (containsDefault) {
                setCreateProfile(true);
              } else {
                if (gymData[0].store === true) {
                  const { data: shopData } = await supabase
                    .from('info_shops')
                    .select()
                    .eq('owner_id', id);

                  if (shopData && shopData.length > 0) {
                    const shopContainsDefault = Object.values(shopData[0]).some(value =>
                      typeof value === 'string' && value.includes("DEFAULT_")
                    );
                    if (shopContainsDefault) {
                      navigate('/shop-stepper');
                      setLoading(false);
                      if (setIsLoading) setIsLoading(false);
                      return;
                    }
                  }
                }

                if (members && members.length === 0)
                  navigate('/bienvenido');
                else
                  navigate("/panel");
              }
            } else if (gymData[0].active === false) {
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
    };

    const saveUser = () => {
      setTimeout(async () => {
        GYM_DEFAULT.owner_id = id;
        GYM_DEFAULT.store = planId === "premium" ? true : false;
        const { data } = await supabase
          .from('info_general_gym')
          .insert(GYM_DEFAULT);

        if (GYM_DEFAULT.store) {
          const newShop = { ...SHOP_DEFAULT, owner_id: id };
          await supabase.from('info_shops').insert(newShop);
        }

        if (data)
          existsUser();
      }, 1000);
    };

    existsUser();
  }, [id, reload, planId, setGymInfoInContext]);

  useEffect(() => {
    checkFormValidity();
  }, [gymInfo, monthly, daily, trainer]);

  useEffect(() => {
    if (clickOnSave) saveGymInfo();
  }, [clickOnSave]);

  const handlerChange = (e) => {
    let { name, value } = e.target;

    if (name === 'owner_name') {
      value = value.replace(/[0-9]/g, '');
    }

    if (name === 'owner_phone' || name === 'public_phone') {
      if (!value.startsWith('DEFAULT_')) {
        value = value.replace(/[^0-9]/g, '');
        if (value.length > 8) value = value.slice(0, 8);
      }
    }

    setGymInfo(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'owner_phone' && useSamePhone) {
        newState.public_phone = value;
      }
      return newState;
    });

    validateFields(name, value);
    if (name === 'owner_phone' && useSamePhone) {
      validateFields('public_phone', value);
    }
  };

  const handleFocus = (e) => {
    let { name, value } = e.target;
    if (typeof value === 'string' && value.startsWith('DEFAULT_')) {
      setGymInfo(prev => ({ ...prev, [name]: '' }));
      validateFields(name, '');
    }
  };

  const handleUseSamePhone = (checked) => {
    setUseSamePhone(checked);
    if (checked) {
      setGymInfo(prev => {
        const newState = { ...prev, public_phone: prev.owner_phone };
        return newState;
      });
      validateFields('public_phone', gymInfo.owner_phone);
    } else {
      setGymInfo(prev => ({ ...prev, public_phone: '' }));
      validateFields('public_phone', '');
    }
  };

  const handleSelectChange = (name, value) => {
    setGymInfo(prev => ({
      ...prev,
      [name]: value
    }));
    validateFields(name, value);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64Image = await processImage(file);
      setGymInfo(prev => ({ ...prev, image_profile: base64Image }));
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleImageDelete = () => {
    setGymInfo(prev => ({ ...prev, image_profile: null }));
  };

  const saveGymInfo = () => {
    let infoToSave = {
      ...gymInfo,
      monthly_payment: monthly ? gymInfo.monthly_payment : null,
      daily_payment: daily ? gymInfo.daily_payment : null,
      trainers_cost: trainer ? gymInfo.trainers_cost : null,
      ai_available_requests: localStorage.getItem("selectedPlanId") === "premium" ? 40 : 10
    };
    setTimeout(async () => {
      try {
        if (!id) return;
        const result = await supabase
          .from("info_general_gym")
          .update(infoToSave)
          .eq("owner_id", id);

        if (result) {
          try {
            const cachedGymInfo = sessionStorage.getItem("gym_info");
            if (cachedGymInfo) {
              const parsed = JSON.parse(cachedGymInfo);
              const updated = { ...parsed, ...infoToSave };
              sessionStorage.setItem("gym_info", JSON.stringify(updated));
            }
          } catch (e) {
            console.error(e);
          }

          if (gymInfo.store === true) {
            const { data: shopData } = await supabase
              .from('info_shops')
              .select()
              .eq('owner_id', id);

            if (shopData && shopData.length > 0) {
              const shopContainsDefault = Object.values(shopData[0]).some(value =>
                typeof value === 'string' && value.includes("DEFAULT_")
              );
              if (shopContainsDefault) {
                navigate('/shop-stepper');
                return;
              }
            }
          }

          navigate('/bienvenido');
        }
      } catch (error) {
        showMessage("Error al guardar la información", "error");
        console.error(error);
      }
    }, 1000);
  };

  const validateFields = (name, value) => {
    let error = "";

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,20}$/;
    const addressRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\/,\.]{15,100}$/;
    const ownerRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    const phoneRegex = /^[0-9]{8}$/;

    if (name === "gym_name") {
      if (!nameRegex.test(value) || value.includes("DEFAULT_")) error = "Letras y números (3-20 caracteres)";
    }
    if (name === "address") {
      if (!addressRegex.test(value) || value.includes("DEFAULT_")) error = "15 a 100 caracteres. Permite # / , .";
    }
    if (name === "owner_name") {
      if (!ownerRegex.test(value) || value.includes("DEFAULT_")) error = "Solo letras y espacios (min 3)";
    }
    if (name === "owner_phone") {
      if (!phoneRegex.test(value)) error = "Teléfono inválido (exacto 8 números)";
    }
    if (name === "public_phone") {
      if (!phoneRegex.test(value)) error = "Teléfono inválido (exacto 8 números)";
    }
    if (name === "monthly_payment" && value !== "" && (isNaN(value) || Number(value) <= 0)) error = "Pago mensual inválido";
    if (name === "daily_payment" && value !== "" && (isNaN(value) || Number(value) <= 0)) error = "Pago diario inválido";
    if (name === "trainers_cost" && value !== "" && (isNaN(value) || Number(value) <= 0)) error = "Pago de entrenador inválido";

    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const applyTemplateSchedule = useCallback((templateSlots, scheduleType) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const daysToApply = [];
      if (scheduleType === 'mon_fri') daysToApply.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
      else if (scheduleType === 'mon_sat') daysToApply.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
      else if (scheduleType === 'all_week') daysToApply.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      allDays.forEach(day => {
        newSchedules[day] = daysToApply.includes(day) ? templateSlots : [];
      });
      return { ...prev, schedules: newSchedules };
    });
  }, []);

  const handleTemplateScheduleChange = (index, field, value) => {
    const newTemplateSlots = [...(gymInfo.schedules.monday || [])];
    newTemplateSlots[index] = { ...newTemplateSlots[index], [field]: value };
    applyTemplateSchedule(newTemplateSlots, generalScheduleType);
  };

  const addTemplateTimeSlot = () => {
    const newTemplateSlots = [...(gymInfo.schedules.monday || []), { start: "08:00", end: "09:00" }];
    applyTemplateSchedule(newTemplateSlots, generalScheduleType);
  };

  const removeTemplateTimeSlot = (index) => {
    const newTemplateSlots = [...(gymInfo.schedules.monday || [])];
    newTemplateSlots.splice(index, 1);
    applyTemplateSchedule(newTemplateSlots, generalScheduleType);
  };

  const handleUseGeneralScheduleChange = (checked) => {
    setUseGeneralSchedule(checked);
    if (checked) {
      setCustomSchedules(gymInfo.schedules);
    } else {
      if (customSchedules) {
        setGymInfo(prev => ({ ...prev, schedules: customSchedules }));
      }
      setCustomSchedules(null);
    }
  };

  useEffect(() => {
    if (useGeneralSchedule) {
      const template = (gymInfo.schedules.monday || []);
      applyTemplateSchedule(template, generalScheduleType);
    }
  }, [generalScheduleType, useGeneralSchedule, applyTemplateSchedule]);

  const checkFormValidity = () => {
    const { gym_name, address, owner_name, owner_phone, public_phone, state, city } = gymInfo;
    const noErrors = !Object.values(errors).some(error => error);

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,20}$/;
    const addressRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\/,\.]{15,100}$/;
    const ownerRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    const phoneRegex = /^[0-9]{8}$/;

    const step0Valid =
      nameRegex.test(gym_name || "") && !(gym_name || "").includes("DEFAULT_") &&
      addressRegex.test(address || "") && !(address || "").includes("DEFAULT_") &&
      ownerRegex.test(owner_name || "") && !(owner_name || "").includes("DEFAULT_") &&
      phoneRegex.test(owner_phone || "") &&
      phoneRegex.test(public_phone || "") &&
      state !== "" && !state.includes("DEFAULT_") &&
      city !== "" && !city.includes("DEFAULT_");

    const step1Valid =
      (!monthly && !daily && !trainer) ? false : // At least one must be checked
        (
          (!monthly || (!isNaN(gymInfo.monthly_payment) && Number(gymInfo.monthly_payment) > 0)) &&
          (!daily || (!isNaN(gymInfo.daily_payment) && Number(gymInfo.daily_payment) > 0)) &&
          (!trainer || (!isNaN(gymInfo.trainers_cost) && Number(gymInfo.trainers_cost) > 0))
        );

    const step2Valid = Object.values(gymInfo.schedules).some(day => day.length > 0);

    let currentStepValid = false;
    if (step === 0) currentStepValid = step0Valid;
    if (step === 1) currentStepValid = step1Valid;
    if (step === 2) currentStepValid = step2Valid;

    setIsSaveButtonEnabled(noErrors && currentStepValid);
  };

  const handleProvinciaChange = (value) => {
    setProvincia(value);
    setGymInfo(prev => ({ ...prev, state: value }));
    setMunicipio('');
  };

  const handleMunicipioChange = (value) => {
    setMunicipio(value);
    setGymInfo(prev => ({ ...prev, city: value }));
  };

  const handleScheduleChange = (dayKey, index, field, value) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const updatedDay = [...newSchedules[dayKey]];
      updatedDay[index] = { ...updatedDay[index], [field]: value };
      newSchedules[dayKey] = updatedDay;
      return { ...prev, schedules: newSchedules };
    });
  };

  const addTimeSlot = (dayKey) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const currentSlots = Array.isArray(newSchedules[dayKey]) ? newSchedules[dayKey] : [];
      newSchedules[dayKey] = [...currentSlots, { start: "08:00", end: "09:00" }];
      return { ...prev, schedules: newSchedules };
    });
  };

  const removeTimeSlot = (dayKey, index) => {
    setGymInfo(prev => {
      const newSchedules = { ...prev.schedules };
      const updatedDay = [...newSchedules[dayKey]];
      updatedDay.splice(index, 1);
      newSchedules[dayKey] = updatedDay;
      return { ...prev, schedules: newSchedules };
    });
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
  };

  const generateWhatsAppLink = () => {
    let planName = "No especificado";
    const selectedPlanId = planId || localStorage.getItem('selectedPlanId');
    if (selectedPlanId === "premium") planName = "Premium";
    else if (selectedPlanId === "estandar") planName = "Estandar";
    else if (selectedPlanId === "market-fit") planName = "Tienda Fitness";

    console.log("Plan ID from context/local:", selectedPlanId);

    const message = `Hola, mi nombre es ${userInfo.name || "Usuario"}. He solicitado el plan "${planName}" con el correo ${userInfo.email || "No especificado"}. Deseo finalizar la creación de mi cuenta.`;
    return `https://wa.me/5356408532?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {userInactive && (
        <div className="text-center space-y-6 py-10">
          <h2 className="text-xl font-bold">Su cuenta está inactiva temporalmente hasta que sea efectuado el pago mensual del uso de la aplicación.</h2>
          <h2 className="text-xl font-bold">Por favor, contacte con el administrador para reactivar su cuenta.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a href={generateWhatsAppLink()} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Contactar por WhatsApp
              </Button>
            </a>
            <Button variant="outline" className="w-full sm:w-auto" onClick={logoutUser}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}

      {withOutAccount && !userInactive && (
        <div className="text-center space-y-6 py-10">
          <h2 className="text-2xl font-bold">¡Registro exitoso!</h2>
          <p className="text-lg text-muted-foreground">Para finalizar la creación de su cuenta debe contactarnos por WhatsApp.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a href={generateWhatsAppLink()} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Contactar por WhatsApp
              </Button>
            </a>
            <Button variant="outline" className="w-full sm:w-auto" onClick={logoutUser}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}

      {createProfile && (
        <div className="w-full">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-primary">Configuración de Gimnasio</h2>
            <p className="text-sm text-muted-foreground mt-1">Complete los datos de su centro de entrenamiento</p>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-border">
                    <AvatarImage src={gymInfo.image_profile} alt="Logo del Gimnasio" />
                    <AvatarFallback>Logo</AvatarFallback>
                  </Avatar>
                  {gymInfo.image_profile && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                      onClick={handleImageDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => fileRef.current?.click()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {gymInfo.image_profile ? "Cambiar Imagen" : "Subir Imagen"}
                  </Button>
                  <div className="text-xs text-muted-foreground">Max: 2MB. Formatos: png, jpg, webp</div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="gym_name">Nombre de gimnasio *</Label>
                  <Input
                    id="gym_name"
                    name="gym_name"
                    value={gymInfo.gym_name?.startsWith("DEFAULT_") ? "" : gymInfo.gym_name}
                    onChange={handlerChange}
                    onFocus={handleFocus}
                    placeholder="Fit 24/7"
                    className={errors.gym_name ? "border-destructive" : ""}
                  />
                  {errors.gym_name && <span className="text-xs text-destructive">{errors.gym_name}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={gymInfo.address?.startsWith("DEFAULT_") ? "" : gymInfo.address}
                    onChange={handlerChange}
                    onFocus={handleFocus}
                    placeholder="Dirección del gimnasio"
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <span className="text-xs text-destructive">{errors.address}</span>}
                </div>

                <div className="grid gap-2">
                  <Label>Provincia *</Label>
                  <Select value={state} onValueChange={handleProvinciaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona Provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(provincias).map((prov) => (
                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Municipio *</Label>
                  <Select value={city} onValueChange={handleMunicipioChange} disabled={!state}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona Municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {(provincias[state] || []).map((mun) => (
                        <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="owner_name">Nombre de Propietario *</Label>
                  <Input
                    id="owner_name"
                    name="owner_name"
                    value={gymInfo.owner_name?.startsWith("DEFAULT_") ? "" : gymInfo.owner_name}
                    onChange={handlerChange}
                    onFocus={handleFocus}
                    placeholder="Nombre del propietario"
                    className={errors.owner_name ? "border-destructive" : ""}
                  />
                  {errors.owner_name && <span className="text-xs text-destructive">{errors.owner_name}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="owner_phone">Teléfono operacional *</Label>
                  <div className="flex items-center">
                    <span className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-md px-3 h-10 text-sm">
                      🇨🇺 +53
                    </span>
                    <Input
                      id="owner_phone"
                      name="owner_phone"
                      value={gymInfo.owner_phone?.startsWith("DEFAULT_") ? "" : gymInfo.owner_phone}
                      onChange={handlerChange}
                      onFocus={handleFocus}
                      placeholder="Ej: 51234567"
                      className={`rounded-l-none ${errors.owner_phone ? "border-destructive" : ""}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Usaremos este número para mantener la comunicación de operaciones.</span>
                  {errors.owner_phone && <span className="text-xs text-destructive">{errors.owner_phone}</span>}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public_phone">Teléfono de contacto *</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="same_phone" checked={useSamePhone} onCheckedChange={handleUseSamePhone} />
                      <Label htmlFor="same_phone" className="text-xs font-normal cursor-pointer">Usar operacional</Label>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-md px-3 h-10 text-sm">
                      🇨🇺 +53
                    </span>
                    <Input
                      id="public_phone"
                      name="public_phone"
                      value={gymInfo.public_phone?.startsWith("DEFAULT_") ? "" : gymInfo.public_phone}
                      onChange={handlerChange}
                      onFocus={handleFocus}
                      disabled={useSamePhone}
                      placeholder="Ej: 51234567"
                      className={`rounded-l-none ${errors.public_phone ? "border-destructive" : ""}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Este teléfono se mostrará al público para que puedan comunicarse con ustedes.</span>
                  {errors.public_phone && <span className="text-xs text-destructive">{errors.public_phone}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex flex-wrap justify-center gap-6 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2">
                  <Checkbox id="monthly" checked={monthly} onCheckedChange={setMonthly} />
                  <Label htmlFor="monthly" className="cursor-pointer">Mensual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="daily" checked={daily} onCheckedChange={setDaily} />
                  <Label htmlFor="daily" className="cursor-pointer">Diario</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="trainer" checked={trainer} onCheckedChange={setTrainer} />
                  <Label htmlFor="trainer" className="cursor-pointer">Entrenador</Label>
                </div>
              </div>

              <div className="space-y-6">
                {monthly && (
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="grid gap-2">
                      <Label htmlFor="monthly_payment">Pago mensual *</Label>
                      <Input
                        id="monthly_payment"
                        name="monthly_payment"
                        type="number"
                        value={gymInfo.monthly_payment || ""}
                        onChange={handlerChange}
                        className={errors.monthly_payment ? "border-destructive" : ""}
                      />
                      {errors.monthly_payment && <span className="text-xs text-destructive">{errors.monthly_payment}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Moneda *</Label>
                      <Select value={gymInfo.monthly_currency} onValueChange={(v) => handleSelectChange('monthly_currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUP">CUP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {daily && (
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="grid gap-2">
                      <Label htmlFor="daily_payment">Pago diario *</Label>
                      <Input
                        id="daily_payment"
                        name="daily_payment"
                        type="number"
                        value={gymInfo.daily_payment || ""}
                        onChange={handlerChange}
                        className={errors.daily_payment ? "border-destructive" : ""}
                      />
                      {errors.daily_payment && <span className="text-xs text-destructive">{errors.daily_payment}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Moneda *</Label>
                      <Select value={gymInfo.daily_currency} onValueChange={(v) => handleSelectChange('daily_currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUP">CUP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {trainer && (
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="grid gap-2">
                      <Label htmlFor="trainers_cost">Costo por entrenador *</Label>
                      <Input
                        id="trainers_cost"
                        name="trainers_cost"
                        type="number"
                        value={gymInfo.trainers_cost || ""}
                        onChange={handlerChange}
                        className={errors.trainers_cost ? "border-destructive" : ""}
                      />
                      {errors.trainers_cost && <span className="text-xs text-destructive">{errors.trainers_cost}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Moneda *</Label>
                      <Select value={gymInfo.trainer_currency} onValueChange={(v) => handleSelectChange('trainer_currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUP">CUP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 bg-muted/20 p-4 border rounded-lg">
                <Checkbox id="useGeneralSchedule" checked={useGeneralSchedule} onCheckedChange={handleUseGeneralScheduleChange} />
                <Label htmlFor="useGeneralSchedule" className="cursor-pointer">Aplicar el mismo horario para todos los días</Label>
              </div>

              {useGeneralSchedule ? (
                <div className="space-y-4">
                  <div className="grid gap-2 max-w-xs">
                    <Label>Aplicar a</Label>
                    <Select value={generalScheduleType} onValueChange={setGeneralScheduleType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mon_fri">Lunes a Viernes</SelectItem>
                        <SelectItem value="mon_sat">Lunes a Sábado</SelectItem>
                        <SelectItem value="all_week">Todos los 7 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <h3 className="font-semibold">Horario General</h3>

                  <div className="space-y-3">
                    {(gymInfo.schedules.monday || []).map((slot, idx) => (
                      <div key={idx} className="flex items-end gap-3">
                        <div className="grid gap-1 flex-1">
                          <Label className="text-xs">Inicio</Label>
                          <Input type="time" value={slot.start} onChange={(e) => handleTemplateScheduleChange(idx, "start", e.target.value)} />
                        </div>
                        <div className="grid gap-1 flex-1">
                          <Label className="text-xs">Fin</Label>
                          <Input type="time" value={slot.end} onChange={(e) => handleTemplateScheduleChange(idx, "end", e.target.value)} />
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => removeTemplateTimeSlot(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addTemplateTimeSlot} size="sm" className="mt-2">
                      + Añadir horario
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {[
                    { key: "monday", label: "Lunes" },
                    { key: "tuesday", label: "Martes" },
                    { key: "wednesday", label: "Miércoles" },
                    { key: "thursday", label: "Jueves" },
                    { key: "friday", label: "Viernes" },
                    { key: "saturday", label: "Sábado" },
                    { key: "sunday", label: "Domingo" }
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-3">
                      <h3 className="font-semibold text-primary">{label}</h3>
                      {Array.isArray(gymInfo.schedules[key]) && gymInfo.schedules[key].map((slot, idx) => (
                        <div key={idx} className="flex items-end gap-3">
                          <div className="grid gap-1 flex-1">
                            <Label className="text-xs">Inicio</Label>
                            <Input type="time" value={slot.start} onChange={(e) => handleScheduleChange(key, idx, "start", e.target.value)} />
                          </div>
                          <div className="grid gap-1 flex-1">
                            <Label className="text-xs">Fin</Label>
                            <Input type="time" value={slot.end} onChange={(e) => handleScheduleChange(key, idx, "end", e.target.value)} />
                          </div>
                          <Button variant="destructive" size="icon" onClick={() => removeTimeSlot(key, idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => addTimeSlot(key)} size="sm" className="mt-2">
                        + Añadir horario
                      </Button>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneralInfo;
