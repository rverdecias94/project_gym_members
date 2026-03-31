/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useMembers } from "../context/Context";
import { supabase } from "../supabase/client";
import moment from "moment/moment";
import { Plus, Edit, Trash2, Image as ImageIcon, Truck, Store as PickupIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DialogMessage from './DialogMessage';
import { useSnackbar } from "../context/Snackbar";

const StoreManagment = () => {
  const { getShopInfo, getAuthUser } = useMembers();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { showMessage } = useSnackbar();

  // Estados para productos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para el formulario
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    image_base64: '',
    product_code: '',
    has_delivery: false,
    has_pickup: false,
    free_delivery: false,
    category: '',
    city: 'El cerro',
    state: 'La Habana',
    discount: '',
    discount_start_date: null,
    discount_end_date: null,
    enable: true,
  });

  const [showDiscount, setShowDiscount] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [filterProductDate, setFilterProductDate] = useState("");

  const [filterOrderClient, setFilterOrderClient] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const [filterOrderProduct, setFilterOrderProduct] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterOrderDate, setFilterOrderDate] = useState("");

  const now = new Date();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersItemsPerPage] = useState(5);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [deleteDialogOpen, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        let data = await getShopInfo();
        if (data) {
          await getProducts();
          await getOrders();
        }
      } catch (error) {
        console.error('Error getting shop info:', error);
      } finally {
        let result = await supabase.from('categories').select('*');
        setCategories(result.data || []);
        setLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  useEffect(() => {
    if (openDialog) {
      validateForm(formData, false); // Do not update errors initially
    }
  }, [formData, openDialog, showDiscount]);

  const getProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data: { user } } = await getAuthUser();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_store_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showMessage('Error al cargar productos', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const mapPurchaseType = (t) => {
    if (t === 0) return 'Recogida local';
    if (t === 1) return 'Envío rápido';
    if (t === 2) return 'Envío gratis';
    return '-';
  };

  const mapStatus = (s) => {
    if (s === 0) return 'Recibida';
    if (s === 1) return 'Procesada';
    if (s === 2) return 'Entregada';
    if (s === 3) return 'Cancelada';
    return '-';
  };

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 0: return { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 border" };
      case 1: return { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 border" };
      case 2: return { variant: "secondary", className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 border" };
      case 3: return { variant: "destructive", className: "" };
      default: return { variant: "secondary", className: "" };
    }
  };

  const getOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data: { user } } = await getAuthUser();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('uid_shop', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];
      const memberIds = Array.from(new Set(rows.map(r => r.uid_members).filter(Boolean)));
      let membersMap = {};
      if (memberIds.length > 0) {
        const { data: membersData } = await supabase
          .from('members')
          .select('member_id, first_name, last_name')
          .in('member_id', memberIds);
        (membersData || []).forEach(m => { membersMap[m.member_id] = `${m.first_name} ${m.last_name}`; });
      }
      const enriched = rows.map(r => ({
        ...r,
        member_name: r.uid_members ? (membersMap[r.uid_members] || '-') : '-',
      }));
      setOrders(enriched);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showMessage('Error al cargar órdenes', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChangeOrderStatus = async (order, newStatus) => {
    if (newStatus === 3) {
      setCancelOrder(order);
      setCancelReason('');
      setOpenCancelDialog(true);
      return;
    }
    setStatusUpdatingId(order.id);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, modification_date: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;
      await getOrders();
      showMessage('Estado actualizado', 'success');
    } catch (err) {
      console.error(err);
      showMessage('No se pudo actualizar el estado', 'error');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrder) return;
    setStatusUpdatingId(cancelOrder.id);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 3, cancellation_reason: cancelReason, modification_date: new Date().toISOString() })
        .eq('id', cancelOrder.id);
      if (error) throw error;
      setOpenCancelDialog(false);
      setCancelOrder(null);
      setCancelReason('');
      await getOrders();
      showMessage('Orden cancelada', 'success');
    } catch (err) {
      console.error(err);
      showMessage('No se pudo cancelar la orden', 'error');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, image: 'Solo se permiten archivos de imagen' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 2MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image_base64: e.target.result }));
        setFormErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (data = formData, updateErrors = true) => {
    const errors = {};

    if (!data.name.trim()) errors.name = 'El nombre es requerido';
    if (!data.description.trim()) errors.description = 'La descripción es requerida';
    if (!data.price || parseFloat(data.price) <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (!data.image_base64) errors.image = 'La imagen es requerida';

    if (showDiscount && data.discount && parseFloat(data.discount) > 0) {
      const discountValue = parseFloat(data.discount);
      const priceValue = parseFloat(data.price);

      if (discountValue >= priceValue) {
        errors.discount = 'El descuento debe ser menor que el precio del producto';
      }
      if (!data.discount_start_date) {
        errors.discount_start_date = 'La fecha de inicio del descuento es requerida';
      }
      if (!data.discount_end_date) {
        errors.discount_end_date = 'La fecha de fin del descuento es requerida';
      }
      if (data.discount_start_date && data.discount_end_date) {
        const startDate = new Date(data.discount_start_date);
        const endDate = new Date(data.discount_end_date);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 10) {
          errors.discount_end_date = 'El período de descuento no puede ser mayor a 10 días';
        }
        if (endDate < startDate) {
          errors.discount_end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
      }
    }

    if (!data.has_delivery && !data.has_pickup && !data.free_delivery) {
      errors.delivery = 'Debe seleccionar al menos una opción de entrega';
    }

    if (updateErrors) {
      setFormErrors(errors);
    }
    setFormIsValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

    if (name === 'discount' && (!value || parseFloat(value) <= 0)) {
      newFormData = { ...newFormData, discount_start_date: null, discount_end_date: null };
    }
    if (name === 'free_delivery' && checked) {
      newFormData.has_delivery = false;
    } else if ((name === 'has_delivery') && checked) {
      newFormData.free_delivery = false;
    }

    setFormData(newFormData);
    setTimeout(() => validateForm(newFormData), 0);
  };

  const handleShowDiscountChange = (e) => {
    const { checked } = e.target;
    setShowDiscount(checked);
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        discount: '',
        discount_start_date: null,
        discount_end_date: null,
      }));
    }
  };

  const handleDateChange = (name, date) => {
    let newFormData = { ...formData, [name]: date };

    if (name === 'discount_start_date' && newFormData.discount_end_date && date > newFormData.discount_end_date) {
      newFormData.discount_end_date = null;
    }

    setFormData(newFormData);
    setTimeout(() => validateForm(newFormData), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await getAuthUser();
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        image_base64: formData.image_base64,
        product_code: formData.product_code || null,
        has_delivery: formData.has_delivery,
        has_pickup: formData.has_pickup,
        free_delivery: formData.free_delivery,
        category: formData.category,
        city: formData.city,
        state: formData.state,
        user_store_id: user.id,
        discount: showDiscount && formData.discount ? parseFloat(formData.discount) : null,
        discount_start_date: showDiscount && formData.discount && formData.discount_start_date ? formData.discount_start_date.toISOString() : null,
        discount_end_date: showDiscount && formData.discount && formData.discount_end_date ? formData.discount_end_date.toISOString() : null,
      };

      if (editingProduct) {
        productData.enable = formData.enable;
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        showMessage("Producto actualizado exitosamente", "success");
      } else {
        productData.enable = true;
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        showMessage("Producto creado exitosamente", "success");
      }
      handleCloseDialog();
      await getProducts();
    } catch (error) {
      if (error.code === '23505') {
        showMessage('Ya existe un producto con ese código. Por favor, use un código diferente o déjelo vacío.', "error");
      } else {
        showMessage('Error al guardar el producto: ' + (error.message || 'Error desconocido'), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    const hasDiscount = product.discount && parseFloat(product.discount) > 0;
    setShowDiscount(hasDiscount);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      image_base64: product.image_base64,
      product_code: product.product_code || '',
      has_delivery: product.has_delivery,
      has_pickup: product.has_pickup,
      free_delivery: product.free_delivery,
      discount: product.discount ? product.discount.toString() : '',
      discount_start_date: product.discount_start_date ? new Date(product.discount_start_date) : null,
      discount_end_date: product.discount_end_date ? new Date(product.discount_end_date) : null,
      category: product.category || '',
      city: product.city || 'El cerro',
      state: product.state || 'La Habana',
      enable: product.enable === false ? false : true,
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete);
      if (error) throw error;
      showMessage("Producto eliminado exitosamente", "success");
      await getProducts();
    } catch (error) {
      showMessage("Error al eliminar el producto: " + (error.message || 'Error desconocido'), "error");
    } finally {
      setDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setShowDiscount(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      image_base64: '',
      product_code: '',
      has_delivery: false,
      has_pickup: false,
      free_delivery: false,
      discount: '',
      discount_start_date: null,
      discount_end_date: null,
      category: '',
      city: 'El cerro',
      state: 'La Habana',
      enable: true
    });
    setFormErrors({});
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || product.category === filterCategory;

    const matchesDelivery =
      !filterDelivery ||
      (filterDelivery === "delivery" && product.has_delivery) ||
      (filterDelivery === "pickup" && product.has_pickup) ||
      (filterDelivery === "free" && product.free_delivery);

    const matchesDate = !filterProductDate || moment(product.created_at).format('YYYY-MM-DD') === filterProductDate;

    return matchesSearch && matchesCategory && matchesDelivery && matchesDate;
  });

  const filteredOrders = orders.filter(order => {
    const matchesClient = !filterOrderClient || (order.member_name || "").toLowerCase().includes(filterOrderClient.toLowerCase());
    const matchesStatus = filterOrderStatus === "all" || order.status.toString() === filterOrderStatus;
    const matchesProduct = !filterOrderProduct || (order.name_products || "").toLowerCase().includes(filterOrderProduct.toLowerCase());
    const matchesId = !filterOrderId || order.id_products?.toString().includes(filterOrderId);
    const matchesDate = !filterOrderDate || moment(order.created_at).format('YYYY-MM-DD') === filterOrderDate;

    return matchesClient && matchesStatus && matchesProduct && matchesId && matchesDate;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const ProductCard = ({ product }) => (
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(product)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(product.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="max-w-[1400px] mx-auto mt-[8rem] mb-8 px-4 flex flex-col md:flex-row gap-4 pb-24 md:pb-0">
      <div className="flex flex-col gap-4 mb-6 md:w-1/4 h-auto">
        <Card className="p-6 w-full shadow-sm border-border relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 z-10 flex justify-center items-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>

          <div className="space-y-4">
            {(tabValue === 0 || tabValue === 2) && (
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
                  <Input
                    id="productDate"
                    type="date"
                    value={filterProductDate}
                    onChange={(e) => setFilterProductDate(e.target.value)}
                    className="mt-1.5"
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
                  <Input
                    id="orderDate"
                    type="date"
                    value={filterOrderDate}
                    onChange={(e) => setFilterOrderDate(e.target.value)}
                    className="mt-1.5"
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
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 md:w-3/4 shadow-sm border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">
            Gestión de Tienda
          </h2>
          <Button
            className="w-full md:w-auto bg-[#e49c10] hover:bg-[#e49c10]/90 text-white"
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                currency: 'USD',
                image: null,
                image_base64: '',
                has_delivery: false,
                has_pickup: false,
                free_delivery: false,
                discount: '',
                discount_start_date: '',
                discount_end_date: '',
                product_code: '',
                category: '',
                city: 'El cerro',
                state: 'La Habana',
                enable: true,
              });
              setFormErrors({});
              setFormIsValid(false);
              setOpenDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <Tabs
          value={tabValue.toString()}
          onValueChange={(v) => setTabValue(parseInt(v))}
          className="w-full mb-6"
        >
          <TabsList className="w-full justify-start h-auto bg-transparent border-b border-border rounded-none p-0 overflow-x-auto flex">
            <TabsTrigger
              value="0"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Lista de Productos
            </TabsTrigger>
            <TabsTrigger
              value="1"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Órdenes
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Catálogo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="0" className="mt-4">
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
                        {loading || loadingProducts ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center">
                              <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                            </td>
                          </tr>
                        ) : currentProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                              No hay productos registrados
                            </td>
                          </tr>
                        ) : (
                          currentProducts.map((product) => (
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
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(product)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(product.id)}>
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
                          onClick={() => handlePageChange(null, Math.max(1, currentPage - 1))}
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
                          onClick={() => handlePageChange(null, Math.min(totalPages, currentPage + 1))}
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
                  {loading || loadingProducts ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  ) : currentProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay productos registrados
                    </div>
                  ) : (
                    <>
                      {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(null, Math.max(1, currentPage - 1))}
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
                            onClick={() => handlePageChange(null, Math.min(totalPages, currentPage + 1))}
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
          </TabsContent>

          <TabsContent value="1" className="mt-4">
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
                        {loadingOrders ? (
                          <tr>
                            <td colSpan={11} className="px-4 py-8 text-center">
                              <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                            </td>
                          </tr>
                        ) : filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                              No hay órdenes registradas
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            const startIndex = (ordersPage - 1) * ordersItemsPerPage;
                            const endIndex = startIndex + ordersItemsPerPage;
                            const currentOrders = filteredOrders.slice(startIndex, endIndex);
                            return currentOrders.map(order => (
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
                                    onValueChange={(v) => handleChangeOrderStatus(order, parseInt(v))}
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
                            ));
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                  {Math.ceil(filteredOrders.length / ordersItemsPerPage) > 1 && (
                    <div className="flex justify-center p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                          disabled={ordersPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center text-sm px-2">
                          Página {ordersPage} de {Math.ceil(filteredOrders.length / ordersItemsPerPage)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(Math.min(Math.ceil(filteredOrders.length / ordersItemsPerPage), ordersPage + 1))}
                          disabled={ordersPage === Math.ceil(filteredOrders.length / ordersItemsPerPage)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {loadingOrders ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay órdenes registradas</div>
                  ) : (
                          (() => {
                      const startIndex = (ordersPage - 1) * ordersItemsPerPage;
                      const endIndex = startIndex + ordersItemsPerPage;
                      const currentOrders = filteredOrders.slice(startIndex, endIndex);
                      return (
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
                                    onValueChange={(v) => handleChangeOrderStatus(order, parseInt(v))}
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
                          {Math.ceil(filteredOrders.length / ordersItemsPerPage) > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                                disabled={ordersPage === 1}
                              >
                                Anterior
                              </Button>
                              <span className="flex items-center text-sm px-2">
                                {ordersPage} / {Math.ceil(filteredOrders.length / ordersItemsPerPage)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrdersPage(Math.min(Math.ceil(filteredOrders.length / ordersItemsPerPage), ordersPage + 1))}
                                disabled={ordersPage === Math.ceil(filteredOrders.length / ordersItemsPerPage)}
                              >
                                Siguiente
                              </Button>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="2" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {loadingProducts ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full">
                  <Alert>
                    <AlertDescription>No hay productos para mostrar</AlertDescription>
                  </Alert>
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="h-full flex flex-col shadow-sm border-border overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={product.image_base64}
                        alt={product.name}
                        className="w-full h-full object-contain bg-muted/20"
                      />
                    </div>
                    <CardContent className="flex-1 pb-4 pt-4">
                      <h3 className="font-bold text-lg mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <h4 className="font-bold text-primary text-xl mb-4">
                        {product.price} {product.currency}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {product.has_delivery && (
                          <Badge variant="outline" className="text-xs">
                            <Truck className="h-3 w-3 mr-1" /> Envío
                          </Badge>
                        )}
                        {product.has_pickup && (
                          <Badge variant="outline" className="text-xs">
                            <PickupIcon className="h-3 w-3 mr-1" /> Recogida
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

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
              className="bg-[#e49c10] hover:bg-[#e49c10]/90 text-white w-full sm:w-auto font-semibold"
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

      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo de Cancelación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Por favor, indique el motivo por el cual cancela esta orden:</Label>
            <Textarea
              id="cancelReason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
              placeholder="Ej: Producto agotado, cliente no responde, etc."
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setOpenCancelDialog(false);
                setCancelOrder(null);
                setCancelReason('');
              }}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={confirmCancelOrder}
              disabled={!cancelReason.trim()}
            >
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar producto */}
      <DialogMessage
        open={deleteDialogOpen}
        handleClose={() => { setDeleteDialog(false); setProductToDelete(null); }}
        fn={handleConfirmDelete}
        title="Eliminar Producto"
        msg="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default StoreManagment;
