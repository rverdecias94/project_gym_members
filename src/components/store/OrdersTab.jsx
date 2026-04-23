/* eslint-disable react/prop-types */

import moment from "moment/moment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const OrdersTab = ({
  isMobile,
  loading,
  orders,
  ordersPage,
  ordersItemsPerPage,
  onOrdersPageChange,
  mapPurchaseType,
  mapStatus,
  getStatusBadgeProps,
  statusUpdatingId,
  onChangeOrderStatus,
}) => {
  const totalPages = Math.ceil(orders.length / ordersItemsPerPage);
  const startIndex = (ordersPage - 1) * ordersItemsPerPage;
  const endIndex = startIndex + ordersItemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  return (
    <div className="w-full">
      {!isMobile ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido ID</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Productos</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Tipo de entrega</th>
                  <th className="px-4 py-3 font-medium">Dirección</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                      No hay órdenes registradas
                    </td>
                  </tr>
                ) : (
                  currentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        <Badge variant="outline" className="bg-primary/5">No-{order.id_products}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{moment(order.created_at).format('DD-MM-YYYY HH:mm')}</td>
                      <td className="px-4 py-3 font-medium">{order.member_name}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={order.name_products}>{order.name_products}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{order.price} {order.currency}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{order.price_total} {order.currency}</td>
                      <td className="px-4 py-3 text-center">{order.amount ?? '-'}</td>
                      <td className="px-4 py-3">{mapPurchaseType(order.purchase_type)}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate" title={order.delivery_address}>{order.delivery_address ? order.delivery_address : '-'}</td>
                      <td className="px-4 py-3">
                        <Badge {...getStatusBadgeProps(order.status)}>
                          {mapStatus(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={order.status.toString()}
                          onValueChange={(v) => onChangeOrderStatus(order, parseInt(v))}
                          disabled={statusUpdatingId === order.id}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Recibida</SelectItem>
                            <SelectItem value="1">Procesada</SelectItem>
                            <SelectItem value="2">Entregada</SelectItem>
                            <SelectItem value="3">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center p-4 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOrdersPageChange(Math.max(1, ordersPage - 1))}
                  disabled={ordersPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center text-sm px-2">
                  Página {ordersPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOrdersPageChange(Math.min(totalPages, ordersPage + 1))}
                  disabled={ordersPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay órdenes registradas</div>
          ) : (
            <>
              {currentOrders.map(order => (
                <Card key={order.id} className="shadow-sm border-border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1 bg-primary/5 text-xs text-muted-foreground border-muted">No-{order.id_products}</Badge>
                        <h3 className="font-bold">{order.member_name}</h3>
                      </div>
                      <Badge {...getStatusBadgeProps(order.status)}>
                        {mapStatus(order.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{moment(order.created_at).format('DD-MM-YYYY HH:mm')}</p>

                    <Separator className="my-2" />

                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Productos:</span> {order.name_products}</p>
                      <p><span className="font-medium">Monto:</span> <span className="text-primary font-bold">{order.price_total} {order.currency}</span></p>
                      <p><span className="font-medium">Cantidad:</span> {order.amount ?? '-'}</p>
                      <p><span className="font-medium">Tipo:</span> {mapPurchaseType(order.purchase_type)}</p>
                      <p><span className="font-medium">Dirección:</span> {order.delivery_address ? order.delivery_address : '-'}</p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-border flex justify-end">
                      <Select
                        value={order.status.toString()}
                        onValueChange={(v) => onChangeOrderStatus(order, parseInt(v))}
                        disabled={statusUpdatingId === order.id}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Recibida</SelectItem>
                          <SelectItem value="1">Procesada</SelectItem>
                          <SelectItem value="2">Entregada</SelectItem>
                          <SelectItem value="3">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOrdersPageChange(Math.max(1, ordersPage - 1))}
                    disabled={ordersPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm px-2">
                    {ordersPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOrdersPageChange(Math.min(totalPages, ordersPage + 1))}
                    disabled={ordersPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;

