/* eslint-disable react/prop-types */
import dayjs from "dayjs";

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

const Field = ({ label, value }) => (
  <div className="grid gap-2">
    <Label className="text-foreground">{label}</Label>
    <Input readOnly value={value ?? "-"} className="text-foreground" />
  </div>
);

export default function ViewDetails({ handleClose, open, profile }) {
  const payDate = profile?.pay_date
    ? dayjs(profile.pay_date).format("DD/MM/YYYY")
    : "-";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Perfil</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" value={profile?.first_name || "-"} />
            <Field label="Apellidos" value={profile?.last_name || "-"} />
            <Field label="CI" value={profile?.ci || "-"} />
            <Field label="Dirección" value={profile?.address || "-"} />
            <Field label="Teléfono" value={profile?.phone ?? "-"} />
            <Field label="Fecha de pago" value={payDate} />
            <Field label="Entrenador" value={profile?.trainer_name || "-"} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
