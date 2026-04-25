/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Trash2 } from "lucide-react";

const formatDateForDb = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function DowngradeStoreDialog({
  open,
  onOpenChange,
  userId,
  gymName,
  onCompleted,
  showMessage,
  onGoToOrders,
}) {
  const [step, setStep] = useState(0);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(null);
  const [activeProductsCount, setActiveProductsCount] = useState(null);
  const [handlingOption, setHandlingOption] = useState("");
  const [acceptNoRefund, setAcceptNoRefund] = useState(false);
  const [executing, setExecuting] = useState(false);

  const hasBlockingOrders = useMemo(() => (pendingOrdersCount ?? 0) > 0, [pendingOrdersCount]);
  const hasActiveProducts = useMemo(() => (activeProductsCount ?? 0) > 0, [activeProductsCount]);

  const resetState = () => {
    setStep(0);
    setPendingOrdersCount(null);
    setActiveProductsCount(null);
    setHandlingOption("");
    setAcceptNoRefund(false);
    setExecuting(false);
  };

  const loadInfo = async () => {
    if (!userId) return;
    setLoadingInfo(true);
    try {
      const { count: pendingCount, error: pendingErr } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("uid_shop", userId)
        .in("status", [0, 1]);

      if (pendingErr) throw pendingErr;

      const { count: productsCount, error: productsErr } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("user_store_id", userId)
        .eq("enable", true);

      if (productsErr) throw productsErr;

      setPendingOrdersCount(pendingCount ?? 0);
      setActiveProductsCount(productsCount ?? 0);
    } catch (e) {
      console.error(e);
      showMessage?.("No se pudo validar el estado de la tienda", "error");
      setPendingOrdersCount(0);
      setActiveProductsCount(0);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    resetState();
    loadInfo();
  }, [open]);

  const canContinueFromStep0 = !loadingInfo && pendingOrdersCount !== null && !hasBlockingOrders;
  const canContinueFromStep1 = !hasActiveProducts || Boolean(handlingOption);
  const canExecute = !executing && !hasBlockingOrders && (!hasActiveProducts || Boolean(handlingOption)) && acceptNoRefund;

  const goNext = () => {
    if (step === 0) {
      if (!canContinueFromStep0) return;
      setStep(hasActiveProducts ? 1 : 2);
      return;
    }
    if (step === 1) {
      if (!canContinueFromStep1) return;
      setStep(2);
      return;
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(hasActiveProducts ? 1 : 0);
      return;
    }
    if (step === 1) {
      setStep(0);
    }
  };

  const executeDowngrade = async () => {
    if (!userId) return;
    setExecuting(true);
    try {
      const { count: pendingCount, error: pendingErr } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("uid_shop", userId)
        .in("status", [0, 1]);

      if (pendingErr) throw pendingErr;
      if ((pendingCount ?? 0) > 0) {
        setPendingOrdersCount(pendingCount ?? 0);
        showMessage?.(
          "No es posible realizar el cambio de plan. Debe marcar todas las órdenes pendientes como 'Entregadas' o 'Canceladas' antes de continuar",
          "error"
        );
        return;
      }

      if (hasActiveProducts && !handlingOption) {
        showMessage?.("Selecciona qué hacer con los productos antes de continuar", "error");
        return;
      }

      if (!acceptNoRefund) {
        showMessage?.("Debes aceptar la advertencia de reembolso para continuar", "error");
        return;
      }

      if (handlingOption === "delete") {
        const { error: delOrderItemsErr } = await supabase
          .from("order_items")
          .delete()
          .eq("uid_tienda", userId);
        if (delOrderItemsErr) throw delOrderItemsErr;

        const { error: delOrdersErr } = await supabase
          .from("orders")
          .delete()
          .eq("uid_shop", userId);
        if (delOrdersErr) throw delOrdersErr;

        const { error: delProductsErr } = await supabase
          .from("products")
          .delete()
          .eq("user_store_id", userId);
        if (delProductsErr) throw delProductsErr;

        const { error: delShopErr } = await supabase
          .from("info_shops")
          .delete()
          .eq("owner_id", userId);
        if (delShopErr) throw delShopErr;
      }

      if (handlingOption === "pause") {
        const { error: pauseProductsErr } = await supabase
          .from("products")
          .update({ enable: false })
          .eq("user_store_id", userId);
        if (pauseProductsErr) throw pauseProductsErr;

        const until = new Date();
        until.setMonth(until.getMonth() + 2);
        const inactiveUntil = formatDateForDb(until);

        const { error: pauseShopErr } = await supabase
          .from("info_shops")
          .update({ active: false, inactive_until: inactiveUntil })
          .eq("owner_id", userId);
        if (pauseShopErr) throw pauseShopErr;
      }

      const { error: downgradeErr } = await supabase
        .from("info_general_gym")
        .update({ store: false })
        .eq("owner_id", userId);

      if (downgradeErr) throw downgradeErr;

      showMessage?.("Cambio de plan aplicado correctamente", "success");
      onCompleted?.();
      onOpenChange?.(false);
    } catch (e) {
      console.error(e);
      showMessage?.("No se pudo completar el downgrade", "error");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Desactivar: Premium a Estándar</DialogTitle>
          <DialogDescription>
            {gymName ? `Gimnasio: ${gymName}. ` : ""}
            Antes de desactivar la tienda, se validan órdenes pendientes y se define el destino de productos.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Paso 1 de 3: Validaciones previas</div>

            {loadingInfo && (
              <Alert>
                <AlertTitle>Validando estado de la tienda</AlertTitle>
                <AlertDescription>Consultando órdenes pendientes y productos activos…</AlertDescription>
              </Alert>
            )}

            {!loadingInfo && pendingOrdersCount !== null && (
              <Alert variant={hasBlockingOrders ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Órdenes pendientes</AlertTitle>
                <AlertDescription>
                  {hasBlockingOrders
                    ? "No es posible realizar el cambio de plan. Debe marcar todas las órdenes pendientes como 'Entregadas' o 'Canceladas' antes de continuar"
                    : "No hay órdenes en estado 'Recibida' o 'Procesada'. Puedes continuar."}
                  <div className="mt-2 text-xs opacity-90">
                    Pendientes: {pendingOrdersCount} (estados: Recibida/Procesada)
                  </div>
                  {hasBlockingOrders && (
                    <div className="mt-3">
                      <Button variant="outline" onClick={onGoToOrders} disabled={!onGoToOrders}>
                        Ir a pedidos
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!loadingInfo && activeProductsCount !== null && (
              <Alert>
                <AlertTitle>Productos activos</AlertTitle>
                <AlertDescription>
                  {hasActiveProducts
                    ? `Hay ${activeProductsCount} productos activos. En el plan Estándar no pueden coexistir productos.`
                    : "No hay productos activos. Si continúas, solo se desactiva la tienda del plan Premium."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Paso 2 de 3: Gestión de productos y tienda</div>

            <Alert>
              <AlertTitle>Selecciona una opción</AlertTitle>
              <AlertDescription>
                Los productos no pueden coexistir con el plan Estándar. Elige qué hacer con el catálogo y la tienda.
              </AlertDescription>
            </Alert>

            <RadioGroup value={handlingOption} onValueChange={setHandlingOption} className="gap-3">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="delete" id="downgrade-delete" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="downgrade-delete" className="font-semibold flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Eliminar productos del sistema
                  </Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    Se eliminan productos, historial de órdenes (incluye entregadas/canceladas) y el registro de tienda.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="pause" id="downgrade-pause" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="downgrade-pause" className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Desactivación temporal (Pausa)
                  </Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    Los productos quedan inactivos, se conserva el historial, y la tienda se marca como inactiva por 2 meses.
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Paso 3 de 3: Confirmación</div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Advertencia de Reembolso</AlertTitle>
              <AlertDescription>
                Al realizar el cambio a un plan de menor costo, la diferencia de precio entre el plan Premium y el Estándar no es reembolsable.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox checked={acceptNoRefund} onCheckedChange={(v) => setAcceptNoRefund(Boolean(v))} id="accept-no-refund" />
              <Label htmlFor="accept-no-refund" className="text-sm leading-5">
                He leído y acepto la advertencia de reembolso.
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={executing}>
            Cancelar
          </Button>
          {step > 0 && (
            <Button variant="outline" onClick={goBack} disabled={executing}>
              Atrás
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={goNext} disabled={(step === 0 && !canContinueFromStep0) || (step === 1 && !canContinueFromStep1) || executing}>
              Continuar
            </Button>
          ) : (
            <Button variant="destructive" onClick={executeDowngrade} disabled={!canExecute}>
              Realizar cambio
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

