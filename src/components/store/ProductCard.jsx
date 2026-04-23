/* eslint-disable react/prop-types */

import { Edit, Trash2, Truck, Store as PickupIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ProductCard = ({ product, onEdit, onDelete }) => (
  <Card className="mb-4 shadow-sm">
    <div className="relative">
      <img
        src={product.image_base64}
        alt={product.name}
        className="w-full h-[120px] object-cover rounded-t-lg"
      />
    </div>
    <CardContent className="pb-2 pt-4">
      <h3 className="font-bold text-base mb-1">
        {product.name}
      </h3>

      <p className="text-xs text-muted-foreground mb-2">
        <strong>Código:</strong> {product.product_code || '-'}
      </p>

      <p className="text-xs text-muted-foreground mb-2 leading-tight">
        {product.description?.length > 80 ? `${product.description.substring(0, 80)}...` : product.description}
      </p>

      <h4 className="font-bold text-primary text-base mb-2">
        {product.price} {product.currency}
      </h4>

      <div className="flex gap-1 mb-2 flex-wrap">
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
    </CardContent>

    <CardFooter className="justify-end pb-2 pt-0 gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => onEdit(product)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(product.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);

export default ProductCard;

