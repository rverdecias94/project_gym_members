/* eslint-disable react/prop-types */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StoreFiltersCard = ({
  loading,
  tabValue,
  categories,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterDelivery,
  setFilterDelivery,
  filterProductDate,
  setFilterProductDate,
  filterOrderClient,
  setFilterOrderClient,
  filterOrderStatus,
  setFilterOrderStatus,
  filterOrderProduct,
  setFilterOrderProduct,
  filterOrderId,
  setFilterOrderId,
  filterOrderDate,
  setFilterOrderDate,
}) => {
  return (
    <Card className="p-6 w-full shadow-sm border-border relative" data-tour="store-filters">
      {loading && (
        <div className="absolute inset-0 bg-background/50 z-10 flex justify-center items-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>

      <div className="space-y-4">
        {tabValue === 0 && (
          <>
            <div>
              <Label htmlFor="search">Buscar producto</Label>
              <Input
                id="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Categoría</Label>
              <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entrega</Label>
              <Select value={filterDelivery || "all"} onValueChange={(v) => setFilterDelivery(v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="delivery">Mensajería</SelectItem>
                  <SelectItem value="pickup">Recogida</SelectItem>
                  <SelectItem value="free">Entrega Gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="productDate">Fecha de creación</Label>
              <DatePicker
                id="productDate"
                value={filterProductDate}
                onChange={setFilterProductDate}
                buttonClassName="mt-1.5 w-full"
              />
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterDelivery("");
                setFilterProductDate("");
              }}
            >
              Limpiar filtros
            </Button>
          </>
        )}

        {tabValue === 1 && (
          <>
            <div>
              <Label htmlFor="orderClient">Cliente</Label>
              <Input
                id="orderClient"
                placeholder="Nombre del cliente..."
                value={filterOrderClient}
                onChange={(e) => setFilterOrderClient(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={filterOrderStatus} onValueChange={setFilterOrderStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0">Recibida</SelectItem>
                  <SelectItem value="1">Procesada</SelectItem>
                  <SelectItem value="2">Entregada</SelectItem>
                  <SelectItem value="3">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orderProduct">Producto</Label>
              <Input
                id="orderProduct"
                placeholder="Nombre del producto..."
                value={filterOrderProduct}
                onChange={(e) => setFilterOrderProduct(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="orderId">Pedido ID</Label>
              <Input
                id="orderId"
                placeholder="Ej. 123"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="orderDate">Fecha</Label>
              <DatePicker
                id="orderDate"
                value={filterOrderDate}
                onChange={setFilterOrderDate}
                buttonClassName="mt-1.5 w-full"
              />
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setFilterOrderClient("");
                setFilterOrderStatus("all");
                setFilterOrderProduct("");
                setFilterOrderId("");
                setFilterOrderDate("");
              }}
            >
              Limpiar filtros
            </Button>
          </>
        )}

        {tabValue === 3 && (
          <Alert>
            <AlertDescription>
              Las estadísticas se calculan con tus productos y órdenes actuales.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default StoreFiltersCard;
