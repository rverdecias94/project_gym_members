/* eslint-disable react/prop-types */

import moment from "moment/moment";
import { Edit, Trash2, Truck, Store as PickupIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ProductCard from "./ProductCard";

const ProductsTab = ({
  isMobile,
  loading,
  products,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full">
      {!isMobile ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Imagen</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">F. Descuento</th>
                  <th className="px-4 py-3 font-medium">Vistas</th>
                  <th className="px-4 py-3 font-medium">Entrega</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border relative">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted/20">
                          <img
                            src={product.image_base64}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={product.discount !== null ? "line-through text-muted-foreground" : ""}>
                            {product.price} {product.currency}
                          </span>
                          {product.discount !== null && (
                            <span className="font-bold text-green-600 dark:text-green-500">
                              {product.discount} {product.currency}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {product.discount !== null ? (
                          <div className="flex flex-col items-center justify-center whitespace-nowrap">
                            <span>{moment(product.discount_start_date).format("DD-MM-YYYY - HH:mm")}</span>
                            <hr className="w-full my-1 border-border" />
                            <span>{moment(product.discount_end_date).format("DD-MM-YYYY - HH:mm")}</span>
                          </div>
                        ) : (
                          <span className="text-center block">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{product.views}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.has_delivery && (
                            <Badge variant="outline" className="text-[10px] h-5 py-0">
                              <Truck className="h-3 w-3 mr-1" /> Mensajería
                            </Badge>
                          )}
                          {product.has_pickup && (
                            <Badge variant="outline" className="text-[10px] h-5 py-0">
                              <PickupIcon className="h-3 w-3 mr-1" /> Recogida
                            </Badge>
                          )}
                          {product.free_delivery && (
                            <Badge variant="default" className="text-[10px] h-5 py-0 bg-green-500 hover:bg-green-600">
                              <Truck className="h-3 w-3 mr-1" /> Gratis
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => onEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center text-sm px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay productos registrados
            </div>
          ) : (
            <>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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

export default ProductsTab;

