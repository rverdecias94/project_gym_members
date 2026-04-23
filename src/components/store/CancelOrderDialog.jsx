/* eslint-disable react/prop-types */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CancelOrderDialog = ({
  open,
  onOpenChange,
  cancelReason,
  onCancelReasonChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Motivo de Cancelación</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="cancelReason">Por favor, indique el motivo por el cual cancela esta orden:</Label>
          <Textarea
            id="cancelReason"
            rows={3}
            value={cancelReason}
            onChange={onCancelReasonChange}
            className="mt-2"
            placeholder="Ej: Producto agotado, cliente no responde, etc."
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={onConfirm}
            disabled={!cancelReason.trim()}
          >
            Confirmar Cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderDialog;

