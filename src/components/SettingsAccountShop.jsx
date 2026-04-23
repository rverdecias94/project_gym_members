/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { provincias } from "./Provincias";
import { useSnackbar } from '../context/Snackbar';

import { processImage } from '../utils/imageProcessor';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Upload, X } from "lucide-react";

export default function SettingsAccountShop({ handleClose, open, profile, isFromGym }) {
  const { showMessage } = useSnackbar();
  const [shopInfo, setShopInfo] = useState({
    owner_id: "",
    shop_name: "",
    owner_name: "",
    owner_phone: "",
    public_phone: "",
    address: "",
    state: "",
    city: "",
    next_payment_date: "",
    schedules: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    image_profile: null
  });

  const [errors, setErrors] = useState({});
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (shopInfo && shopInfo.next_payment_date !== "") {
      const calculateDays = () => {
        const today = new Date();
        const futureDate = new Date(shopInfo.next_payment_date);
        const timeDifference = futureDate - today;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        setDaysRemaining(daysDifference);
      };
      calculateDays();
    }
  }, [shopInfo]);

  useEffect(() => {
    const existsUser = async () => {
      // If we don't have a profile prop, try to get the current user
      let userId = profile?.id;
      let userEmail = profile?.email;

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email;
        } else {
          return;
        }
      }

      const { data, error } = await supabase
        .from('info_shops')
        .select()
        .eq('owner_id', userId)

      if (error) {
        console.error("Error fetching info_shops:", error);
        return;
      }

      if (data?.length > 0) {
        const defaultSchedules = {
          monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        };
        let obj = {
          ...data[0],
          email: userEmail,
          owner_id: data[0].owner_id || userId,
          schedules: { ...defaultSchedules, ...(data[0].schedules || {}) }
        }; // Store email temporarily for display
        setShopInfo(obj);
      }
    }
    existsUser();
  }, [open, profile, isFromGym]);

  const handleProvinciaChange = (value) => {
    setShopInfo(prev => ({
      ...prev,
      state: value,
      city: ""
    }));
  };

  const handleMunicipioChange = (value) => {
    setShopInfo(prev => ({
      ...prev,
      city: value
    }));
  };

  const handlerChange = (e) => {
    let { name, value } = e.target;
    let isValid = true;
    let errorMsg = "";

    // Validaciones
    if (name === 'shop_name') {
      isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,30}$/.test(value);
      if (!isValid) errorMsg = "De 3 a 30 caracteres. Letras y números permitidos.";
    } else if (name === 'owner_name') {
      isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(value);
      if (!isValid) errorMsg = "De 3 a 50 caracteres. Solo letras permitidas.";
      value = value.replace(/\d/g, ''); // Evitar números
    } else if (name === 'address') {
      isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\/,\.]{10,100}$/.test(value);
      if (!isValid) errorMsg = "Mínimo 10 caracteres.";
    } else if (name === 'owner_phone' || name === 'public_phone') {
      isValid = /^[0-9]{8}$/.test(value);
      if (!isValid) errorMsg = "Debe tener exactamente 8 dígitos.";
      value = value.replace(/\D/g, '').slice(0, 8); // Solo números, max 8
    }

    setShopInfo(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: !isValid ? errorMsg : null
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64Image = await processImage(file);
      setShopInfo(prev => ({ ...prev, image_profile: base64Image }));
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleImageDelete = () => {
    setShopInfo(prev => ({ ...prev, image_profile: null }));
  };

  const handleScheduleChange = (day, index, field, value) => {
    setShopInfo(prev => {
      const updatedDay = [...prev.schedules[day]];
      updatedDay[index] = { ...updatedDay[index], [field]: value };
      return { ...prev, schedules: { ...prev.schedules, [day]: updatedDay } };
    });
  };

  const addTimeSlot = (day) => {
    setShopInfo(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: [...prev.schedules[day], { start: "", end: "" }]
      }
    }));
  };

  const removeTimeSlot = (day, index) => {
    setShopInfo(prev => {
      const updatedDay = [...prev.schedules[day]];
      updatedDay.splice(index, 1);
      return {
        ...prev,
        schedules: { ...prev.schedules, [day]: updatedDay }
      };
    });
  };

  const validateForm = () => {
    const {
      shop_name,
      owner_name,
      owner_phone,
      public_phone,
      address,
      state,
      city,
      schedules
    } = shopInfo;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,30}$/;
    const ownerRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    const addressRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\/,\.]{10,100}$/;
    const phoneRegex = /^[0-9]{8}$/;

    if (!nameRegex.test(shop_name || "") || (shop_name || "").includes("DEFAULT_")) {
      showMessage("El nombre de la tienda es inválido o está vacío.", "error");
      return false;
    }
    if (!ownerRegex.test(owner_name || "") || (owner_name || "").includes("DEFAULT_")) {
      showMessage("El nombre del propietario es inválido o está vacío.", "error");
      return false;
    }
    if (!addressRegex.test(address || "") || (address || "").includes("DEFAULT_")) {
      showMessage("La dirección es inválida o está vacía.", "error");
      return false;
    }
    if (!phoneRegex.test(owner_phone || "")) {
      showMessage("El teléfono operacional debe tener 8 dígitos.", "error");
      return false;
    }
    if (!phoneRegex.test(public_phone || "")) {
      showMessage("El teléfono de contacto debe tener 8 dígitos.", "error");
      return false;
    }
    if (!state || state.includes("DEFAULT_") || !city || city.includes("DEFAULT_")) {
      showMessage("Debe seleccionar una provincia y un municipio válidos.", "error");
      return false;
    }

    const hasSchedule = Object.values(schedules).some(day => day.length > 0);
    if (!hasSchedule) {
      showMessage("Debe configurar al menos un horario.", "error");
      return false;
    }

    // Check if any active error exists in state
    if (Object.values(errors).some(err => err !== null)) {
      showMessage("Por favor corrija los errores en el formulario.", "error");
      return false;
    }

    return true;
  };

  const saveShopInfo = () => {
    if (!validateForm()) return;
    const { owner_id, email, ...infoToSave } = shopInfo; // Exclude email from save

    setTimeout(async () => {
      try {
        const result = await supabase
          .from("info_shops")
          .update(infoToSave)
          .eq("owner_id", owner_id);

        if (result) {
          try {
            const cachedShopInfo = sessionStorage.getItem("shop_info");
            if (cachedShopInfo) {
              const parsed = JSON.parse(cachedShopInfo);
              const updated = { ...parsed, ...infoToSave };
              sessionStorage.setItem("shop_info", JSON.stringify(updated));
            }
          } catch (e) {
            console.error(e);
          }
          showMessage("¡Información actualizada con éxito!", "success");
          if (handleClose) handleClose();
        }
      } catch (error) {
        console.error(error)
      }
    }, 500);
  };

  const DAYS = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" }
  ];

  if (isFromGym) {
    return (
      <div className="w-full bg-card rounded-lg border border-border shadow-sm pb-[calc(env(safe-area-inset-bottom)+6rem)] md:pb-0">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            Configuración de la cuenta: <span className="font-normal text-muted-foreground">{shopInfo.email || profile?.email || "correo@gmail.com"}</span>
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6 space-y-4">
            <Label>Logo de la Tienda</Label>
            <div className="flex items-center gap-4">
              {shopInfo.image_profile ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <div className="w-full h-full rounded-full border overflow-hidden">
                    <img src={shopInfo.image_profile} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={handleImageDelete}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm transform translate-x-1 -translate-y-1 z-10"
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted/50 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">Sin logo</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="image_upload_gym" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
                    <Upload size={16} />
                    {shopInfo.image_profile ? 'Cambiar imagen' : 'Subir imagen'}
                  </div>
                </Label>
                <input
                  id="image_upload_gym"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <span className="text-xs text-muted-foreground">Max: 2MB. Formatos: png, jpg, webp</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name_gym">Nombre de la tienda <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="shop_name_gym" name="shop_name" value={shopInfo?.shop_name} onChange={handlerChange} className={errors.shop_name ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.shop_name && <span className="text-xs text-red-500">{errors.shop_name}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_name_gym">Propietario <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_name_gym" name="owner_name" value={shopInfo?.owner_name} onChange={handlerChange} className={errors.owner_name ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.owner_name && <span className="text-xs text-red-500">{errors.owner_name}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_gym">Dirección <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="address_gym" name="address" value={shopInfo?.address} onChange={handlerChange} className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone_gym">Teléfono operacional <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_phone_gym" name="owner_phone" value={shopInfo?.owner_phone} onChange={handlerChange} className={errors.owner_phone ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.owner_phone && <span className="text-xs text-red-500">{errors.owner_phone}</span>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cuenta inactiva en</Label>
                <Input value={`${daysRemaining} días`} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Provincia <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Select value={shopInfo?.state} onValueChange={handleProvinciaChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(provincias).map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Municipio <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Select value={shopInfo?.city} onValueChange={handleMunicipioChange} disabled={!shopInfo?.state} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {(provincias[shopInfo.state] || []).map((mun) => (
                      <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="public_phone_gym">Teléfono de contacto <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="public_phone_gym" name="public_phone" value={shopInfo?.public_phone} onChange={handlerChange} className={errors.public_phone ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.public_phone && <span className="text-xs text-red-500">{errors.public_phone}</span>}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="text-lg font-medium mb-4">Horarios de la tienda</h4>
            <div className="space-y-6">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">{label}</Label>
                    <Button variant="outline" size="sm" onClick={() => addTimeSlot(key)}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir horario
                    </Button>
                  </div>

                  {Array.isArray(shopInfo.schedules[key]) && shopInfo.schedules[key].length > 0 ? (
                    <div className="space-y-2">
                      {shopInfo.schedules[key].map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Inicio</Label>
                            <TimePicker
                              value={slot.start}
                              onChange={(val) => handleScheduleChange(key, idx, "start", val)}
                            />
                          </div>
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Fin</Label>
                            <TimePicker
                              value={slot.end}
                              onChange={(val) => handleScheduleChange(key, idx, "end", val)}
                            />
                          </div>
                          <div className="mt-5">
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeTimeSlot(key, idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay horarios configurados para este día.</p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2 bg-muted/20 rounded-b-lg pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <Button className="bg-[#e49c10] hover:bg-[#e49c10]/90 text-white" onClick={saveShopInfo}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            Configuración de la cuenta: <span className="font-normal text-muted-foreground">{profile.email || "correo@gmail.com"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-6 space-y-4">
            <Label>Logo de la Tienda</Label>
            <div className="flex items-center gap-4">
              {shopInfo.image_profile ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <div className="w-full h-full rounded-full border overflow-hidden">
                    <img src={shopInfo.image_profile} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={handleImageDelete}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm transform translate-x-1 -translate-y-1 z-10"
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted/50 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">Sin logo</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="image_upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
                    <Upload size={16} />
                    {shopInfo.image_profile ? 'Cambiar imagen' : 'Subir imagen'}
                  </div>
                </Label>
                <input
                  id="image_upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <span className="text-xs text-muted-foreground">Max: 2MB. Formatos: png, jpg, webp</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Nombre de la tienda <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="shop_name" name="shop_name" value={shopInfo?.shop_name} onChange={handlerChange} className={errors.shop_name ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.shop_name && <span className="text-xs text-red-500">{errors.shop_name}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_name">Propietario <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_name" name="owner_name" value={shopInfo?.owner_name} onChange={handlerChange} className={errors.owner_name ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.owner_name && <span className="text-xs text-red-500">{errors.owner_name}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="address" name="address" value={shopInfo?.address} onChange={handlerChange} className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Teléfono operacional <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_phone" name="owner_phone" value={shopInfo?.owner_phone} onChange={handlerChange} className={errors.owner_phone ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.owner_phone && <span className="text-xs text-red-500">{errors.owner_phone}</span>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cuenta inactiva en</Label>
                <Input value={`${daysRemaining} días`} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Provincia <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Select value={shopInfo?.state} onValueChange={handleProvinciaChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(provincias).map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Municipio <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Select value={shopInfo?.city} onValueChange={handleMunicipioChange} disabled={!shopInfo?.state} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {(provincias[shopInfo.state] || []).map((mun) => (
                      <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="public_phone">Teléfono de contacto <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="public_phone" name="public_phone" value={shopInfo?.public_phone} onChange={handlerChange} className={errors.public_phone ? "border-red-500 focus-visible:ring-red-500" : ""} required />
                {errors.public_phone && <span className="text-xs text-red-500">{errors.public_phone}</span>}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="text-lg font-medium mb-4">Horarios de la tienda</h4>
            <div className="space-y-6">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">{label}</Label>
                    <Button variant="outline" size="sm" onClick={() => addTimeSlot(key)}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir horario
                    </Button>
                  </div>

                  {Array.isArray(shopInfo.schedules[key]) && shopInfo.schedules[key].length > 0 ? (
                    <div className="space-y-2">
                      {shopInfo.schedules[key].map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Inicio</Label>
                            <TimePicker
                              value={slot.start}
                              onChange={(val) => handleScheduleChange(key, idx, "start", val)}
                            />
                          </div>
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Fin</Label>
                            <TimePicker
                              value={slot.end}
                              onChange={(val) => handleScheduleChange(key, idx, "end", val)}
                            />
                          </div>
                          <div className="mt-5">
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeTimeSlot(key, idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay horarios configurados para este día.</p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex justify-end gap-2 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button className="bg-[#e49c10] hover:bg-[#e49c10]/90 text-white" onClick={saveShopInfo}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
