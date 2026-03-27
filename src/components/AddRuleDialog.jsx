/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import { useMembers } from '../context/Context';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AddRuleDialog({
  handleClose, selectedRows, setSelectedRows, open, handlerChangeAmount, amountDays }) {

  const { applyRuleToRows, trainersList } = useMembers();
  const [inactivateUsers, setActivateUsers] = useState(false);
  const [addMonth, setAddMonth] = useState(false);
  const [addDays, setAddDays] = useState(false);
  const [new_trainer, setNewTrainer] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [trainer_name, setTrainerName] = useState("");

  useEffect(() => {
    if (trainersList?.length > 0) {
      const trainersArr = [];

      trainersArr.push({ value: "Sin Entrenador", label: "Sin Entrenador" })

      trainersList.forEach(element => {
        trainersArr.push({ value: element.name, label: element.name });
      });
      setTrainers(trainersArr);
    }
  }, [trainersList])

  const handleApplyRule = () => {
    if (inactivateUsers) {
      let newRows = selectedRows.map(row => {
        return { ...row, active: false };
      })
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setActivateUsers(false);
      }
    } else if (addMonth) {
      let newRows = selectedRows.map(elem => {
        const fechaPago = new Date(elem.pay_date);
        fechaPago.setMonth(fechaPago.getMonth() + 1);
        // Verificar si el mes resultante es enero para ajustar el año
        if (fechaPago.getMonth() === 0) {
          fechaPago.setFullYear(fechaPago.getFullYear() + 1);
        }
        // Formatear la fecha en formato día, mes, año
        const dia = fechaPago.getDate();
        const mes = fechaPago.getMonth() + 1;
        const año = fechaPago.getFullYear();
        return { ...elem, pay_date: `${año}-${mes}-${dia}` };
      });
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setAddMonth(false);
      }
    } else if (addDays) {
      let newRows = selectedRows.map(elem => {
        const fechaPago = new Date(elem.pay_date);
        fechaPago.setDate(fechaPago.getDate() + parseInt(amountDays));
        return {
          ...elem,
          pay_date: fechaPago.toISOString().split('T')[0]
        };
      });
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setAddDays(false);
      }
    } else if (new_trainer) {
      let newRows = selectedRows.map(elem => {
        let newTrainer = trainer_name;
        return {
          ...elem,
          trainer_name: newTrainer
        };
      });
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setAddDays(false);
      }
    }
  };

  const isFormValid = addMonth || inactivateUsers || (addDays && amountDays !== "") || (new_trainer && trainer_name !== "");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reglas de Clientes</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">Seleccione una regla a aplicar a los clientes seleccionados</p>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <Checkbox
              id="inactivate"
              checked={inactivateUsers}
              onCheckedChange={() => {
                setAddDays(false);
                setAddMonth(false);
                setNewTrainer(false);
                setActivateUsers(!inactivateUsers);
                handlerChangeAmount({ target: { value: "" } });
              }}
            />
            <Label htmlFor="inactivate" className="flex-1 cursor-pointer font-normal">
              {`Desactivar ${selectedRows && selectedRows.length > 1 ? "clientes seleccionados" : "cliente seleccionado"}`}
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <Checkbox
              id="addMonth"
              checked={addMonth}
              onCheckedChange={() => {
                setActivateUsers(false);
                setAddDays(false);
                setAddMonth(!addMonth);
                setNewTrainer(false);
                handlerChangeAmount({ target: { value: "" } });
              }}
            />
            <Label htmlFor="addMonth" className="flex-1 cursor-pointer font-normal">
              Adicionar un mes a la fecha de pago
            </Label>
          </div>

          <div className="flex flex-col space-y-3 p-3 rounded-lg border border-border transition-colors">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="newTrainer"
                checked={new_trainer}
                onCheckedChange={() => {
                  setActivateUsers(false);
                  setAddMonth(false);
                  setAddDays(false);
                  setNewTrainer(!new_trainer);
                  handlerChangeAmount({ target: { value: "" } });
                }}
              />
              <Label htmlFor="newTrainer" className="flex-1 cursor-pointer font-normal">
                Nuevo entrenador
              </Label>
            </div>
            
            {new_trainer && (
              <div className="pl-7 pr-2 pt-2">
                <Select
                  value={trainer_name}
                  onValueChange={setTrainerName}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un entrenador" />
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
          </div>

          <div className="flex flex-col space-y-3 p-3 rounded-lg border border-border transition-colors">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="addDays"
                checked={addDays}
                onCheckedChange={() => {
                  setActivateUsers(false);
                  setAddMonth(false);
                  setAddDays(!addDays);
                  handlerChangeAmount({ target: { value: "" } });
                  setNewTrainer(false);
                }}
              />
              <Label htmlFor="addDays" className="flex-1 cursor-pointer font-normal">
                Definir cantidad de días a la fecha de pago
              </Label>
            </div>

            {addDays && (
              <div className="pl-7 pr-2 pt-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ej: 7"
                  name="amount"
                  onChange={handlerChangeAmount}
                  value={amountDays}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto bg-[#e49c10] hover:bg-[#c9890e] text-white font-semibold"
            disabled={!isFormValid}
            onClick={handleApplyRule}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}