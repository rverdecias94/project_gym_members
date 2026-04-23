/* eslint-disable react/prop-types */

import ReactApexChart from "react-apexcharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const StoreStatsTab = ({ storeStats, getChartOptions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-4 border-border shadow-sm">
        <div className="p-6 pb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Órdenes</h3>
          <p className="text-2xl font-bold text-foreground">{storeStats.totalOrders}</p>
        </div>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Entregadas: <span className="font-medium text-foreground">{storeStats.deliveredOrdersCount}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4 border-border shadow-sm">
        <div className="p-6 pb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Productos</h3>
          <p className="text-2xl font-bold text-foreground">{storeStats.totalProducts}</p>
        </div>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Categorías: <span className="font-medium text-foreground">{storeStats.categoryChart.length}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4 border-border shadow-sm">
        <div className="p-6 pb-3">
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
        </div>
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
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Órdenes por estado</h3>
        </div>
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
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Productos por categoría</h3>
        </div>
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
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Productos olvidados</h3>
          <p className="text-2xl font-bold text-foreground">{storeStats.forgottenProducts.length}</p>
        </div>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Productos sin ventas en el último mes
          </p>
          {storeStats.forgottenProducts.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {storeStats.forgottenProducts.slice(0, 5).map((product) => (
                <div key={product.id_products} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground truncate">{product.name_products}</span>
                  <Badge variant="outline" className="text-xs">Sin ventas</Badge>
                </div>
              ))}
              {storeStats.forgottenProducts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{storeStats.forgottenProducts.length - 5} más
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No hay productos olvidados</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6 border-border shadow-sm">
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Top Productos</h3>
          <p className="text-xs text-muted-foreground">Más vendidos</p>
        </div>
        <CardContent className="pt-0">
          {storeStats.productRanking.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {storeStats.productRanking.map((product, index) => (
                <div key={product.id_products} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{index + 1}</span>
                    <span className="text-muted-foreground truncate">{product.name_products}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{product.totalSales} ventas</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No hay datos de ventas</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6 border-border shadow-sm">
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Alertas Inteligentes</h3>
          <p className="text-xs text-muted-foreground">Recomendaciones automáticas</p>
        </div>
        <CardContent className="pt-0">
          {storeStats.alerts.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {storeStats.alerts.map((alert, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${alert.type === "warning" ? "bg-yellow-500/10 border border-yellow-500/20" :
                  alert.type === "success" ? "bg-green-500/10 border border-green-500/20" : ""
                  }`}>
                  <span>{alert.icon}</span>
                  <span className="text-muted-foreground">{alert.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No hay alertas</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6 border-border shadow-sm">
        <div className="p-6 pb-2">
          <h3 className="text-sm font-semibold text-foreground">Predicción</h3>
          <p className="text-xs text-muted-foreground">Categoría con mejor desempeño</p>
        </div>
        <CardContent className="pt-0">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{storeStats.predictedTopCategory}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en el histórico de ventas
            </p>
          </div>
          {storeStats.forgottenProducts.length > 0 && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Recomendación:</strong> Considera aplicar descuentos a productos olvidados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreStatsTab;

