/* eslint-disable react/prop-types */

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatUsd } from "../utils/premiumUpgrade";

export default function UpgradePremiumDialog({ open, onOpenChange, preview, submitting, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar upgrade a Premium</DialogTitle>
        </DialogHeader>

        {preview ? (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Próximo mes de facturación:</span> {preview.nextBillingDate}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">(+) Costo Plan Premium:</span> ${formatUsd(preview.premiumCost)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">(+) Cargo adicional por días Premium:</span> ${formatUsd(preview.proratedDiff)}
            </div>
            <Separator />
            <div className="text-sm font-semibold">
              Total a pagar en próxima factura: ${formatUsd(preview.totalNextInvoice)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Calculando…</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={submitting || !preview}>
            {submitting ? "Procesando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

