/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMembers } from "../context/Context";

const PaymentModal = ({ open, handleClose, member }) => {
  const { registerPayment, gymInfo, trainersList, adding } = useMembers();

  const [trainerName, setTrainerName] = useState("");
  const [months, setMonths] = useState(1);
  const [paymentDate, setPaymentDate] = useState(() => dayjs().format("YYYY-MM-DD"));

  const gymPrice = Number(gymInfo?.monthly_payment ?? 0);
  const trainerPrice = Number(gymInfo?.trainers_cost ?? 0);
  const gymCurrency = gymInfo?.monthly_currency || "CUP";
  const trainerCurrency = gymInfo?.trainer_currency || "CUP";

  useEffect(() => {
    if (!open) return;
    setTrainerName(member?.trainer_name || "");
    setMonths(1);
    setPaymentDate(dayjs().format("YYYY-MM-DD"));
  }, [open, member]);

  const trainers = Array.isArray(trainersList) ? trainersList : [];
  const hasTrainer = Boolean(trainerName);

  const computedNextPayDate = useMemo(() => {
    return dayjs(paymentDate).add(Number(months) || 1, "month");
  }, [paymentDate, months]);

  const totals = useMemo(() => {
    const baseAmount = gymPrice * (Number(months) || 1);
    const trainerAmount = hasTrainer ? trainerPrice * (Number(months) || 1) : 0;
    return {
      baseAmount,
      trainerAmount,
      totalAmount: baseAmount + trainerAmount,
    };
  }, [gymPrice, trainerPrice, months, hasTrainer]);

  const trainerOptionMissing =
    trainerName && !trainers.some((t) => t?.name === trainerName);

  const handleSubmit = async () => {
    if (!member) return;
    await registerPayment(
      { ...member, trainer_name: trainerName || null },
      Number(months) || 1,
      Boolean(trainerName)
    );
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col max-h-[85vh] text-foreground">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Registrar Pago</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 bg-muted/20">
          <div className="grid gap-4">
            <div>
              <div className="text-base font-semibold text-foreground">
                Información del Cliente
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input readOnly value={member?.first_name || ""} />
                </div>
                <div className="grid gap-2">
                  <Label>Apellidos</Label>
                  <Input readOnly value={member?.last_name || ""} />
                </div>
                <div className="grid gap-2">
                  <Label>CI</Label>
                  <Input readOnly value={member?.ci || ""} />
                </div>
                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  <Input readOnly value={member?.phone || ""} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Fecha de último pago</Label>
                  <Input
                    readOnly
                    value={
                      member?.pay_date
                        ? dayjs(member.pay_date).format("DD/MM/YYYY")
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-base font-semibold text-foreground">
                Configuración del Pago
              </div>

              <div className="mt-3 grid gap-4">
                <div className="grid gap-2">
                  <Label>Entrenador</Label>
                  <Select
                    value={trainerName || "none"}
                    onValueChange={(val) => setTrainerName(val === "none" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar entrenador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin entrenador</SelectItem>
                      {trainerOptionMissing && (
                        <SelectItem value={trainerName}>{trainerName} (actual)</SelectItem>
                      )}
                      {trainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.name}>
                          {trainer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Meses a pagar</Label>
                  <RadioGroup
                    value={String(months)}
                    onValueChange={(val) => setMonths(Number(val))}
                    className="flex flex-wrap gap-6"
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="1" />
                      1 mes
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="2" />
                      2 meses
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="3" />
                      3 meses
                    </Label>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>Nueva Fecha de Pago</Label>
                  <Input
                    readOnly
                    value={computedNextPayDate.format("DD/MM/YYYY")}
                  />
                  <div className="text-xs text-muted-foreground">
                    Fecha calculada automáticamente (desde la fecha del registro del pago)
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-base font-semibold text-foreground">
                Resumen del Pago
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">
                    Membresía ({months} {Number(months) === 1 ? "mes" : "meses"})
                  </div>
                  <div className="font-medium text-foreground">
                    {totals.baseAmount} {gymCurrency}
                  </div>
                </div>

                {hasTrainer && (
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">
                      Entrenador ({months} {Number(months) === 1 ? "mes" : "meses"})
                    </div>
                    <div className="font-medium text-foreground">
                      {totals.trainerAmount} {trainerCurrency}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-foreground">Total</div>
                  <div className="text-base font-semibold text-primary">
                    {totals.totalAmount} {gymCurrency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} disabled={adding}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={adding || !member}>
            {adding ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </span>
            ) : (
              "Registrar Pago"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
