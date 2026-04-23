/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import ImageUploader from './ImageUploader';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TrainersForm({ trainer, onClose }) {
  const { createNewTrainer, adding, updateTrainer, gymInfo } = useMembers();
  const navigate = useNavigate();
  const isPremiumGym = gymInfo?.store === true;
  const [trainerData, setTrainerData] = useState({
    name: '',
    last_name: '',
    ci: '',
  });
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
      setImageBase64(trainer?.image_profile ?? null);
      setEditing(true);
    }
  }, [trainer]);

  const handlerSubmit = async (e) => {
    e.preventDefault();
    let updatedTrainer = { ...trainerData };

    updatedTrainer.image_profile = isPremiumGym ? imageBase64 : null;
    editing ? await updateTrainer(updatedTrainer) : await createNewTrainer(updatedTrainer);
    setTrainerData({
      name: '',
      last_name: '',
      ci: '',
    });
    setImageBase64(null);
    if (editing) {
      onClose();
    } else {
      navigate('/entrenadores');
    }
  };

  const handlerChange = (e) => {
    let { name, value } = e.target;
    let newValue = value;
    let isValid = true;

    if (name === 'name' || name === 'last_name') {
      isValid = !/\d/.test(value);
      newValue = value.replace(/\d/g, '');
    } else if (name === 'ci') {
      isValid = /^\d{0,11}$/.test(value);
      newValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setTrainerData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: !isValid
    }));
  };

  const isFormValid = () => {
    return (
      !errors?.name &&
      !errors?.last_name &&
      !errors?.ci &&
      trainerData?.name?.trim() !== '' &&
      trainerData?.last_name?.trim() !== '' &&
      trainerData?.ci?.length === 11
    );
  };

  return (
    <div className={`flex flex-col pb-[calc(env(safe-area-inset-bottom)+6rem)] md:pb-0 ${!editing ? 'p-4 md:p-8 max-w-4xl mx-auto mt-20 md:mt-4' : 'p-4 md:p-6'}`}>
      {!editing && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center text-primary">
            Nuevo Entrenador
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigate('/entrenadores')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <form onSubmit={handlerSubmit} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Column */}
          <div className="w-full lg:w-[400px] flex flex-col items-center shrink-0">
            <div className="w-full bg-card rounded-xl border border-border p-4 shadow-sm">
              {isPremiumGym ? (
                <ImageUploader image={imageBase64} setImageBase64={setImageBase64} />
              ) : (
                <div className="w-full">
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground text-center px-4">
                      Subir foto / Cámara disponible solo para cuentas Premium
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fields Column */}
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={trainerData?.name}
                  onChange={handlerChange}
                  placeholder="Ej: Jhon"
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={trainerData?.last_name}
                  onChange={handlerChange}
                  placeholder="Ej: Doe Smith"
                  className={errors.last_name ? "border-destructive focus-visible:ring-destructive" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ci">CI <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
                <Input
                  id="ci"
                  name="ci"
                  value={trainerData?.ci}
                  onChange={handlerChange}
                  placeholder="11 dígitos"
                  maxLength={11}
                  className={errors.ci || (trainerData?.ci?.length > 0 && trainerData?.ci?.length < 11) ? "border-destructive focus-visible:ring-destructive" : ""}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
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
                    {editing ? "Guardar Cambios" : "Guardar Entrenador"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TrainersForm;
