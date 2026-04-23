/* eslint-disable react/prop-types */

import { CheckCircle, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import UpgradePremiumDialog from "../UpgradePremiumDialog";

const GymStoreNotEnabledView = ({
  upgradePreview,
  upgradeDialogOpen,
  setUpgradeDialogOpen,
  upgradeSubmitting,
  onConfirmUpgrade,
  onWhatsAppRequest,
  formatUsd,
}) => {
  return (
    <div className="max-w-5xl mx-auto mt-[6rem] mb-12 pb-10 px-4 space-y-6">
      <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 md:p-6">
        <p className="text-sm font-semibold text-primary mb-2">Amplía tu cuenta de gimnasio</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Activa la tienda y centraliza tu operación en un solo sistema
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
          Mantén las herramientas que ya usas en tu gimnasio y suma una tienda integrada para administrar tu negocio desde el mismo panel.
        </p>
      </div>

      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          <div className="md:col-span-5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border text-center md:text-left bg-background">
            <StoreIcon className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto md:mx-0 mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Tienda no habilitada</h3>
            <p className="text-muted-foreground mb-6">
              Tu cuenta actual funciona correctamente para la gestión del gimnasio, pero todavía no tiene activada la tienda virtual.
            </p>

            <div className="space-y-3">
              <Button className="w-full py-6" onClick={() => setUpgradeDialogOpen(true)}>
                Upgrade a Premium
              </Button>
              <Button variant="outline" className="w-full" onClick={onWhatsAppRequest}>
                Consultar por WhatsApp
              </Button>
            </div>
          </div>

          <div className="md:col-span-7 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-background to-primary/5">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold text-primary mb-2">🛍️ Tienda integrada</p>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Suma la tienda sin salir del ecosistema de tu gimnasio
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  El plan premium complementa las funciones actuales del gimnasio y agrega funciones sobre la tienda virtual para que trabajes con más control desde un mismo lugar.
                </p>
              </div>

              <Alert className="bg-background/60 border-border">
                <AlertTitle>Próxima factura estimada</AlertTitle>
                <AlertDescription>
                  {upgradePreview ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Fecha de cobro:</span> {upgradePreview.nextBillingDate}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Mes actual:</span> {upgradePreview.accountMonth}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Costo Premium:</span> ${formatUsd(upgradePreview.premiumCost)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cargo prorrateado:</span> ${formatUsd(upgradePreview.proratedDiff)}
                      </div>
                      <div className="text-sm font-semibold sm:col-span-2">
                        Total en próxima factura: ${formatUsd(upgradePreview.totalNextInvoice)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Calculando…</span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div className="sm:col-span-4">
                  <div className="rounded-2xl p-5 text-center border border-border bg-card shadow-sm">
                    <span className="text-3xl font-bold text-primary block">$5</span>
                    <span className="text-sm text-muted-foreground">USD/mes</span>
                  </div>
                </div>

                <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">Gestión de productos</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">Gestión de órdenes</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">Estadísticas de la tienda</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <UpgradePremiumDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        preview={upgradePreview}
        submitting={upgradeSubmitting}
        onConfirm={onConfirmUpgrade}
      />
    </div>
  );
};

export default GymStoreNotEnabledView;

