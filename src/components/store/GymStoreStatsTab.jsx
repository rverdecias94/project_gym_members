/* eslint-disable react/prop-types */

import ReactApexChart from "react-apexcharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const GymStoreStatsTab = ({ storeStats, getChartOptions }) => {
  return (
    <>
      {storeStats.alerts.length > 0 && (
        <div className="lg:col-span-12 mb-4">
          <Alert className="border-l-4 border-l-yellow-500">
            <AlertTitle>Alertas Inteligentes</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {storeStats.alerts.map((alert, index) => (
                  <li key={index} className="text-sm">{alert}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {storeStats.forgottenProducts.length > 0 && (
        <div className="lg:col-span-12 mb-4">
          <Alert className="border-l-4 border-l-blue-500">
            <AlertTitle>Recomendaciones Automáticas</AlertTitle>
            <AlertDescription>
              <p className="text-sm mb-2">
                <strong>{storeStats.forgottenProducts.length} productos</strong> sin ventas en el último mes deberían considerar descuento o promoción.
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Sugerencia: Aplica un 10-20% de descuento en estos productos para impulsar sus ventas.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {storeStats.topCategory !== "Sin datos" &&
        <div className="lg:col-span-12 mb-4">
          <Alert className="border-l-4 border-l-green-500">
            <AlertTitle>Predicción de Ventas</AlertTitle>
            <AlertDescription>
              <p className="text-sm">
                📈 La categoría <strong>{storeStats.topCategory}</strong> ha tenido el mejor desempeño histórico.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sugerencia: Considera aumentar el inventario en esta categoría.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Órdenes</h3>
            <p className="text-2xl font-bold text-foreground">{storeStats.totalOrders}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Entregadas: <span className="font-medium text-foreground">{storeStats.deliveredOrdersCount}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Productos</h3>
            <p className="text-2xl font-bold text-foreground">{storeStats.totalProducts}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Categorías: <span className="font-medium text-foreground">{storeStats.categoryChart.length}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Ingresos (Entregadas)</h3>
            <p className="text-2xl font-bold text-foreground">
              {Object.keys(storeStats.incomeByCurrency).length === 0 ? (
                `0`
              ) : Object.keys(storeStats.incomeByCurrency).length === 1 ? (
                (() => {
                  const currency = Object.keys(storeStats.incomeByCurrency)[0];
                  const total = storeStats.incomeByCurrency[currency] || 0;
                  return `${total.toFixed(2)} ${currency}`;
                })()
              ) : (
                `Multi-moneda`
              )}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {Object.keys(storeStats.incomeByCurrency).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(storeStats.incomeByCurrency).map(([currency, total]) => (
                  <p key={currency} className="text-xs text-muted-foreground">
                    {currency}: <span className="font-medium text-foreground">{total.toFixed(2)}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No hay órdenes entregadas.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 border-border shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-foreground">Órdenes por estado</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {storeStats.totalOrders > 0 ? (
              <ReactApexChart
                options={getChartOptions(storeStats.statusLabels, true, ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"])}
                series={storeStats.ordersByStatus}
                type="donut"
                height={280}
              />
            ) : (
              <div className="flex justify-center items-center h-[280px] text-muted-foreground text-sm">
                No hay datos
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-foreground">Productos por categoría</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {storeStats.totalProducts > 0 ? (
              <ReactApexChart
                options={getChartOptions(storeStats.categoryChart.map((c) => (c.name.length > 16 ? `${c.name.slice(0, 16)}...` : c.name)), false, ["#6164c7"])}
                series={[{ name: "Productos", data: storeStats.categoryChart.map((c) => c.total) }]}
                type="bar"
                height={280}
              />
            ) : (
              <div className="flex justify-center items-center h-[280px] text-muted-foreground text-sm">
                No hay datos
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-border shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-foreground">Productos olvidados</h3>
            <p className="text-xs text-muted-foreground">Sin ventas en el último mes</p>
          </CardHeader>
          <CardContent className="pt-0">
            {storeStats.forgottenProducts.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {storeStats.forgottenProducts.slice(0, 5).map((product) => (
                  <div key={product.id_products} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium truncate">{product.name_products}</span>
                    <Badge variant="outline" className="text-xs">Sin ventas</Badge>
                  </div>
                ))}
                {storeStats.forgottenProducts.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">+{storeStats.forgottenProducts.length - 5} más</p>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground text-sm">
                No hay productos olvidados
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-border shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-foreground">Ranking de productos</h3>
            <p className="text-xs text-muted-foreground">Top 5 más vendidos</p>
          </CardHeader>
          <CardContent className="pt-0">
            {storeStats.productRanking.length > 0 ? (
              <div className="space-y-2">
                {storeStats.productRanking.slice(0, 5).map((product, index) => (
                  <div key={product.id_products} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                      <span className="text-sm font-medium truncate">{product.name_products}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{product.totalSales} ventas</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground text-sm">
                No hay ventas registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GymStoreStatsTab;

