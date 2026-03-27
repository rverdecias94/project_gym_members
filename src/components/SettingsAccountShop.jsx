/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { provincias } from "./Provincias";
import { useSnackbar } from '../context/Snackbar';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";

export default function SettingsAccountShop({ handleClose, open, profile }) {
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
  });

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
      if (!profile.id) return;
      const { data } = await supabase
        .from('info_shops')
        .select()
        .eq('owner_id', profile.id)

      if (data?.length > 0) {
        let obj = { ...data[0] };
        setShopInfo(obj);
      }
    }
    existsUser();
  }, [open, profile]);

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
    setShopInfo(prev => ({
      ...prev,
      [name]: value
    }));
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
      address,
      state,
      city,
      schedules
    } = shopInfo;

    if (
      !shop_name?.trim() ||
      !owner_name?.trim() ||
      !owner_phone?.trim() ||
      !address?.trim() ||
      !state ||
      !city
    ) {
      showMessage("Por favor complete todos los campos obligatorios.", "error");
      return false;
    }

    const hasSchedule = Object.values(schedules).some(day => day.length > 0);
    if (!hasSchedule) {
      showMessage("Debe configurar al menos un horario.", "error");
      return false;
    }

    return true;
  };

  const saveShopInfo = () => {
    if (!validateForm()) return;
    const { owner_id, ...infoToSave } = shopInfo;

    setTimeout(async () => {
      try {
        const result = await supabase
          .from("info_shops")
          .update(infoToSave)
          .eq("owner_id", owner_id);

        if (result) {
          showMessage("¡Información actualizada con éxito!", "success");
          handleClose();
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            Configuración de la cuenta: <span className="font-normal text-muted-foreground">{profile.email || "correo@gmail.com"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Nombre de la tienda <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="shop_name" name="shop_name" value={shopInfo?.shop_name} onChange={handlerChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_name">Propietario <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_name" name="owner_name" value={shopInfo?.owner_name} onChange={handlerChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="address" name="address" value={shopInfo?.address} onChange={handlerChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_phone">Teléfono operacional <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input id="owner_phone" name="owner_phone" value={shopInfo?.owner_phone} onChange={handlerChange} required />
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
                <Input id="public_phone" name="public_phone" value={shopInfo?.public_phone} onChange={handlerChange} required />
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
                            <Input 
                              type="time" 
                              value={slot.start} 
                              onChange={(e) => handleScheduleChange(key, idx, "start", e.target.value)} 
                            />
                          </div>
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Fin</Label>
                            <Input 
                              type="time" 
                              value={slot.end} 
                              onChange={(e) => handleScheduleChange(key, idx, "end", e.target.value)} 
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

        <DialogFooter className="px-6 py-4 border-t flex justify-end gap-2">
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
