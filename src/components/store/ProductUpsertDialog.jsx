/* eslint-disable react/prop-types */

import moment from "moment/moment";
import { Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const ProductUpsertDialog = ({
  openDialog,
  setOpenDialog,
  editingProduct,
  formData,
  setFormData,
  categories,
  showDiscount,
  formErrors,
  submitting,
  formIsValid,
  submitButtonClassName,
  handleInputChange,
  handleImageUpload,
  handleShowDiscountChange,
  handleDateChange,
  validateForm,
  handleCloseDialog,
  handleSubmit,
}) => {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
          {editingProduct && (
            <div className="md:col-span-12 flex items-center space-x-2">
              <Switch
                id="enable"
                checked={formData.enable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable: checked }))}
              />
              <Label htmlFor="enable">Producto Disponible</Label>
            </div>
          )}

          <div className="md:col-span-4 space-y-2 flex flex-col justify-end">
            <Label htmlFor="name">Nombre del producto <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
          </div>

          <div className="md:col-span-4 space-y-2 flex flex-col justify-end">
            <Label htmlFor="product_code">Código de producto (Opcional)</Label>
            <Input
              id="product_code"
              name="product_code"
              value={formData.product_code}
              onChange={handleInputChange}
            />
          </div>

          <div className="md:col-span-4 space-y-2 flex flex-col justify-end">
            <Label>Categoría <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
            <Select
              value={formData.category || undefined}
              onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.category}>
                    {category.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-12 space-y-2">
            <Label htmlFor="description">Descripción <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className={formErrors.description ? "border-red-500" : ""}
            />
            {formErrors.description && <span className="text-xs text-red-500">{formErrors.description}</span>}
          </div>

          <div className="md:col-span-8 space-y-2">
            <Label htmlFor="price">Precio <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className={formErrors.price ? "border-red-500" : ""}
            />
            {formErrors.price && <span className="text-xs text-red-500">{formErrors.price}</span>}
          </div>

          <div className="md:col-span-4 space-y-2">
            <Label>Moneda <span className="text-red-600 font-extrabold text-lg ml-1">*</span></Label>
            <Select
              value={formData.currency}
              onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CUP">CUP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editingProduct && (
            <div className="md:col-span-12 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showDiscount"
                  checked={showDiscount}
                  onCheckedChange={(checked) => handleShowDiscountChange({ target: { checked } })}
                />
                <Label htmlFor="showDiscount" className="cursor-pointer font-medium">
                  Añadir precio rebajado y período de oferta
                </Label>
              </div>
            </div>
          )}

          {editingProduct && showDiscount && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 bg-muted/20 p-4 rounded-lg border border-border">
              {!editingProduct && (
                <div className="md:col-span-12">
                  <Alert className="bg-yellow-50/50 text-yellow-800 border-yellow-200">
                    <AlertDescription className="text-xs">
                      Manipular precios para aparentar grandes descuentos daña la confianza de los clientes. Mantenga precios reales y coherentes: la transparencia genera más ventas y fidelidad.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="discount">Nuevo Precio (Rebaja aplicada)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleInputChange}
                  disabled={!formData.price || parseFloat(formData.price) <= 0}
                  className={formErrors.discount ? "border-red-500" : ""}
                />
                {formErrors.discount && <span className="text-xs text-red-500">{formErrors.discount}</span>}
                {formData.discount && formData.price && parseFloat(formData.discount) < (parseFloat(formData.price) / 2) && !formErrors.discount && (
                  <span className="text-[11px] text-amber-600 mt-1 block">
                    ⚠️ El descuento supera el 50% del precio original.
                  </span>
                )}
              </div>

              {formData.discount && parseFloat(formData.discount) > 0 && (
                <>
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="discount_start_date">Inicio de la oferta</Label>
                    <Input
                      id="discount_start_date"
                      type="datetime-local"
                      value={formData.discount_start_date ? moment(formData.discount_start_date).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => handleDateChange('discount_start_date', e.target.value ? new Date(e.target.value) : null)}
                      min={!editingProduct ? moment().format('YYYY-MM-DDTHH:mm') : undefined}
                      className={formErrors.discount_start_date ? "border-red-500" : ""}
                    />
                    {formErrors.discount_start_date && <span className="text-xs text-red-500">{formErrors.discount_start_date}</span>}
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="discount_end_date">Fin de la oferta</Label>
                    <Input
                      id="discount_end_date"
                      type="datetime-local"
                      value={formData.discount_end_date ? moment(formData.discount_end_date).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => handleDateChange('discount_end_date', e.target.value ? new Date(e.target.value) : null)}
                      min={formData.discount_start_date ? moment(formData.discount_start_date).format('YYYY-MM-DDTHH:mm') : moment().format('YYYY-MM-DDTHH:mm')}
                      className={formErrors.discount_end_date ? "border-red-500" : ""}
                    />
                    {formErrors.discount_end_date && <span className="text-xs text-red-500">{formErrors.discount_end_date}</span>}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="md:col-span-12">
            <div className="border border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click para subir imagen</span>
                </div>
              </Label>
              {formErrors.image && (
                <span className="text-xs text-red-500 block mt-2">{formErrors.image}</span>
              )}
              {formData.image_base64 && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={formData.image_base64}
                    alt="Preview"
                    className="max-w-[200px] max-h-[200px] object-contain rounded-md border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-12 space-y-4 bg-muted/30 p-4 rounded-lg">
            <Label className="text-base font-semibold">Opciones de entrega</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_delivery"
                  checked={formData.has_delivery}
                  disabled={formData.free_delivery}
                  onCheckedChange={(checked) => {
                    setFormData(prev => {
                      const newFormData = { ...prev, has_delivery: checked };
                      setTimeout(() => validateForm(newFormData), 0);
                      return newFormData;
                    });
                  }}
                />
                <Label htmlFor="has_delivery" className={`cursor-pointer ${formData.free_delivery ? 'text-muted-foreground' : 'font-normal'}`}>
                  Mensajería/Envío a domicilio (costo adicional)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free_delivery"
                  checked={formData.free_delivery}
                  disabled={formData.has_delivery}
                  onCheckedChange={(checked) => {
                    setFormData(prev => {
                      const newFormData = { ...prev, free_delivery: checked };
                      setTimeout(() => validateForm(newFormData), 0);
                      return newFormData;
                    });
                  }}
                />
                <Label htmlFor="free_delivery" className={`cursor-pointer ${formData.free_delivery ? 'font-medium text-green-600' : formData.has_delivery ? 'text-muted-foreground' : 'font-normal'}`}>
                  Entrega gratis (el vendedor entrega sin costo)
                </Label>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_pickup"
                  checked={formData.has_pickup}
                  onCheckedChange={(checked) => {
                    setFormData(prev => {
                      const newFormData = { ...prev, has_pickup: checked };
                      setTimeout(() => validateForm(newFormData), 0);
                      return newFormData;
                    });
                  }}
                />
                <Label htmlFor="has_pickup" className="font-normal cursor-pointer">
                  Recogida en tienda
                </Label>
              </div>
            </div>

            {formErrors.delivery && (
              <span className="text-xs text-red-500 block mt-2">{formErrors.delivery}</span>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCloseDialog}
          >
            Cancelar
          </Button>
          <Button
            className={submitButtonClassName}
            onClick={handleSubmit}
            disabled={submitting || !formIsValid}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              editingProduct ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpsertDialog;
