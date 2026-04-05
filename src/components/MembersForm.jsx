/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import dayjs from 'dayjs';
import ImageUploader from './ImageUploader';
import { useNavigate, useLocation } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserPlus, Save } from 'lucide-react';
import "dayjs/locale/es";

function MembersForm({ member = {}, open, handleClose, virifiedAcount = false, associated }) {
  const { createNewMember, adding, updateClient, trainersList } = useMembers();
  const [memberData, setMemberData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    ci: '',
    address: '',
    phone: '',
    has_trainer: false,
    trainer_name: null,
  });
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    ci: false,
    phone: false,
  });

  const [editing, setEditing] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [trainers, setTrainers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/clientes";

  dayjs.locale("es");

  const today = dayjs().format('YYYY-MM-DD');
  const minDate = dayjs().subtract(2, 'months').format('YYYY-MM-DD');

  useEffect(() => {
    if (member && Object.keys(member).length > 0) {

      let new_payment_date = null;

      if (associated) {
        const fechaSeleccionada = dayjs(today);
        // 👇 sumamos un mes exacto, respetando el día y el año
        const fechaFinal = fechaSeleccionada.add(1, "month");
        // 👇 formateamos
        new_payment_date = fechaFinal.format("YYYY-MM-DD");
      }
      // 👇 tomamos la fecha seleccionada por el usuario

      const normalizedMember = {
        ...member,
        pay_date: associated ? new_payment_date : member.pay_date,
        phone: member?.phone !== undefined && member?.phone !== null ? String(member.phone) : '',
        // Asegurar que clientes asociados lleguen sin entrenador marcado
        has_trainer: associated ? false : member.has_trainer,
        trainer_name: associated ? null : member.trainer_name,
      };
      setMemberData(normalizedMember);
      setImageBase64(member?.image_profile ?? null);
      setEditing(true);
    }
  }, [member]);

  useEffect(() => {
    if (trainersList?.length > 0) {
      const trainers = trainersList.map(element => ({
        value: element.name,
        label: element.name
      }));
      setTrainers(trainers);
    }
  }, [trainersList]);

  const handlerSubmit = async (e) => {
    e.preventDefault();
    let updatedMember = { ...memberData };

    updatedMember.image_profile = imageBase64;

    if (virifiedAcount) {
      updatedMember.active = true;
    }

    editing ? await updateClient(updatedMember, virifiedAcount) : await createNewMember(updatedMember);

    setMemberData({
      first_name: '',
      last_name: '',
      gender: 'M',
      ci: '',
      address: '',
      phone: '',
      has_trainer: false,
      trainer_name: null,
    });
    setImageBase64(null);
    handleClose();
    setEditing(false);
    navigate(from, { replace: true });
  };

  const handlerChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
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

    setMemberData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: !isValid
    }));

    if (name === 'has_trainer' && !checked) {
      setMemberData(prev => ({
        ...prev,
        trainer_name: null
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setMemberData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setMemberData(prev => ({ ...prev, pay_date: e.target.value }));
  };

  const isFormValid = () => {
    const hasTrainerValid = memberData.has_trainer ? memberData.trainer_name : true;
    return (
      !errors.first_name &&
      !errors.last_name &&
      !errors.ci &&
      memberData?.address?.trim() !== '' &&
      memberData?.ci?.length === 11 &&
      memberData?.first_name?.trim() !== '' &&
      memberData?.last_name?.trim() !== '' &&
      !errors.phone &&
      memberData?.phone?.length === 8 &&
      hasTrainerValid &&
      memberData?.pay_date
    );
  };

  const clearAndClose = () => {
    setMemberData({
      first_name: '',
      last_name: '',
      gender: 'M',
      ci: '',
      address: '',
      phone: '',
      has_trainer: false,
      trainer_name: null,
    });
    setImageBase64(null);
    setEditing(false);
    handleClose();
  };

  // Get max date for native date input (only for creation)


  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && clearAndClose()}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10 flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center text-xl font-bold">
            <UserPlus className="w-5 h-5 mr-2 text-primary" />
            {editing && associated ? "Detalles de Cliente" : editing ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clearAndClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-4 md:p-6">
          <form className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Column */}
              <div className="w-full lg:w-[400px] flex flex-col items-center gap-4 shrink-0">
                <div className="w-full bg-card rounded-xl">
                  <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
                </div>

                {editing && (
                  <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg w-full border border-border">
                    <Checkbox
                      id="active"
                      name="active"
                      checked={memberData?.active === true ? true : virifiedAcount}
                      onCheckedChange={(checked) => handlerChange({ target: { name: 'active', type: 'checkbox', checked } })}
                    />
                    <Label htmlFor="active" className="font-medium cursor-pointer">
                      Cliente Activo
                    </Label>
                  </div>
                )}
              </div>

              {/* Fields Column */}
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={memberData?.first_name}
                      onChange={handlerChange}
                      placeholder="Ej: John"
                      className={errors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellidos <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={memberData?.last_name}
                      onChange={handlerChange}
                      placeholder="Ej: Doe Smith"
                      className={errors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ci">CI <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                    <Input
                      id="ci"
                      name="ci"
                      value={memberData?.ci}
                      onChange={handlerChange}
                      placeholder="11 dígitos"
                      maxLength={11}
                      className={errors.ci || (memberData?.ci?.length > 0 && memberData?.ci?.length < 11) ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={memberData?.phone}
                      onChange={handlerChange}
                      placeholder="8 dígitos"
                      maxLength={8}
                      className={errors.phone || (memberData?.phone?.length > 0 && memberData?.phone?.length < 8) ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                  <Input
                    id="address"
                    name="address"
                    value={memberData?.address}
                    onChange={handlerChange}
                    placeholder="Ej: Calle Principal #123"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <div className="flex items-center gap-4 h-10">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender_m"
                          name="gender"
                          value="M"
                          checked={memberData?.gender === 'M'}
                          onChange={handlerChange}
                          className="w-4 h-4 text-primary border-border focus:ring-primary accent-primary"
                        />
                        <Label htmlFor="gender_m" className="font-normal cursor-pointer">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gender_f"
                          name="gender"
                          value="F"
                          checked={memberData?.gender === 'F'}
                          onChange={handlerChange}
                          className="w-4 h-4 text-primary border-border focus:ring-primary accent-primary"
                        />
                        <Label htmlFor="gender_f" className="font-normal cursor-pointer">Femenino</Label>
                      </div>
                    </div>
                  </div>

                  {trainers.length > 0 && (
                    <div className="space-y-2 flex flex-col justify-center">
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id="has_trainer"
                          name="has_trainer"
                          checked={memberData?.has_trainer}
                          onCheckedChange={(checked) => handlerChange({ target: { name: 'has_trainer', type: 'checkbox', checked } })}
                        />
                        <Label htmlFor="has_trainer" className="font-normal cursor-pointer">Solicita entrenador</Label>
                      </div>
                    </div>
                  )}
                </div>

                {memberData?.has_trainer && (
                  <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <Label>Seleccionar Entrenador <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                    <Select
                      value={memberData?.trainer_name || ""}
                      onValueChange={(val) => handleSelectChange('trainer_name', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona entrenador" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pay_date">
                    {editing ? "Próxima fecha de pago" : "Fecha de pago inicial"} <span className="text-red-600 font-extrabold text-lg ml-1">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="pay_date"
                    name="pay_date"
                    value={memberData?.pay_date ? dayjs(memberData.pay_date).format('YYYY-MM-DD') : ''}
                    onChange={handleDateChange}
                    max={!editing ? today : undefined}
                    min={!editing ? minDate : undefined}
                    className="w-full flex-1"
                  />

                  {!editing && (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg mt-2 space-y-1 border border-border">
                      <p>• Si es nuevo, selecciona la <strong>fecha de hoy</strong>.</p>
                      <p>• Si ya tenía pago previo, usa la <strong>última fecha real</strong>.</p>
                      <p>• El sistema sumará <strong>1 mes automáticamente</strong> para el próximo pago.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-4 md:p-6 border-t border-border sticky bottom-0 bg-card z-10 flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={clearAndClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlerSubmit}
            disabled={!isFormValid() || adding}
            className="w-full sm:w-auto bg-[#e49c10] hover:bg-[#c9890e] text-white font-semibold"
          >
            {adding ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cliente
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MembersForm;