/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useMembers } from "../context/Context";
import { supabase } from "../supabase/client";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  useMediaQuery,
  useTheme,
  CardActions,
  Pagination,
  FormHelperText,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  LocalShipping as DeliveryIcon,
  Store as PickupIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../context/Snackbar";

const StoreManagment = () => {
  const { getShopInfo } = useMembers();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { showMessage } = useSnackbar();
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  // CHANGE: Se confirma que el número de items por página es 5.
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
  });

  const [showDiscount, setShowDiscount] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const now = new Date();

  useEffect(() => {
    const getData = async () => {
      try {
        let data = await getShopInfo();
        if (data) {
          await getProducts();
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
      validateForm();
    }
  }, [formData, openDialog, showDiscount]);

  const getProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_store_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
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
      setFormIsValid(Object.keys(errors).length === 0);
    }
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
      newFormData.has_pickup = false;
    } else if ((name === 'has_delivery' || name === 'has_pickup') && checked) {
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
      const { data: { user } } = await supabase.auth.getUser();
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
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        showMessage("Producto actualizado exitosamente", "success");
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        showMessage("Producto creado exitosamente", "success");
      }
      handleCloseDialog();
      await getProducts();
    } catch (error) {
      showMessage("Error al guardar el producto: " + (error.message || 'Error desconocido'), "error");
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
      state: product.state || 'La Habana'
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showMessage("Producto eliminado exitosamente", "success");
      await getProducts();
    } catch (error) {
      showMessage("Error al eliminar el producto: " + (error.message || 'Error desconocido'), "error");
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
      state: 'La Habana'
    });
    setFormErrors({});
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Lógica de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const ProductCard = ({ product }) => (
    <Card sx={{ mb: 10, boxShadow: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia component="img" height="120" image={product.image_base64} alt={product.name} sx={{ objectFit: 'cover' }} />
      </Box>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}><strong>Código:</strong> {product.product_code}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', lineHeight: 1.3 }}>
          {product.description.length > 80 ? `${product.description.substring(0, 80)}...` : product.description}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>{product.price} {product.currency}</Typography>
        <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
          {product.has_delivery && (
            <Chip
              icon={<DeliveryIcon sx={{ fontSize: '0.7rem' }} />}
              label="Mensajería"
              size="small"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
          {product.has_pickup && (
            <Chip
              icon={<PickupIcon sx={{ fontSize: '0.7rem' }} />}
              label="Recogida"
              size="small"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
          {product.free_delivery && (
            <Chip
              icon={<DeliveryIcon sx={{ fontSize: '0.7rem' }} />}
              label="Entrega Gratis"
              size="small"
              color="success"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1 }}>
        <IconButton color="primary" onClick={() => handleEdit(product)} size="small"><EditIcon sx={{ fontSize: '1.1rem' }} /></IconButton>
        <IconButton color="error" onClick={() => handleDelete(product.id)} size="small"><DeleteIcon sx={{ fontSize: '1.1rem' }} /></IconButton>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ marginTop: "4rem", mb: 16 }}>
      <Paper sx={{ p: isMobile ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 2 : 0}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">Gestión de Tienda</Typography>
          <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }} />} onClick={() => setOpenDialog(true)} size={isMobile ? "medium" : "large"} fullWidth={isMobile} sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>Nuevo Producto</Button>
        </Box>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3, '& .MuiTab-root': { fontSize: isMobile ? '0.8rem' : '0.875rem', minWidth: isMobile ? 'auto' : 160 } }} variant={isMobile ? "fullWidth" : "standard"}>
          <Tab label="Lista de Productos" />
          <Tab label="Catálogo" />
        </Tabs>
        {tabValue === 0 && (
          <>
            {!isMobile && (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Imagen</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Entrega</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingProducts ? (
                        <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                      ) : products.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center">No hay productos registrados</TableCell></TableRow>
                      ) : (
                        // CHANGE: Se itera sobre 'currentProducts' en lugar de 'products' para mostrar solo los de la página actual.
                        currentProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell><Box sx={{ width: 50, height: 50 }}><img src={product.image_base64} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} /></Box></TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.product_code}</TableCell>
                            <TableCell>{product.price} {product.currency}</TableCell>
                            <TableCell>
                              <Box display="flex" gap={1} flexWrap="wrap">
                                {product.has_delivery && (
                                  <Chip icon={<DeliveryIcon />} label="Mensajería" size="small" />
                                )}
                                {product.has_pickup && (
                                  <Chip icon={<PickupIcon />} label="Recogida" size="small" />
                                )}
                                {product.free_delivery && (
                                  <Chip icon={<DeliveryIcon />} label="Entrega Gratis" size="small" color="success" />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell><IconButton onClick={() => handleEdit(product)} color="primary"><EditIcon /></IconButton><IconButton onClick={() => handleDelete(product.id)} color="error"><DeleteIcon /></IconButton></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* CHANGE: Se añade el componente de paginación para la vista de escritorio. */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
                  </Box>
                )}
              </>
            )}
            {isMobile && (
              <Box sx={{ width: '100%' }}>
                {loadingProducts ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : products.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4, fontSize: '0.9rem' }}>No hay productos registrados</Typography>
                ) : (
                  <>
                    {currentProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
                    {totalPages > 1 && (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="small" showFirstButton showLastButton /></Box>)}
                  </>
                )}
              </Box>
            )}
          </>
        )}
        {tabValue === 1 && (
          <Grid container spacing={isMobile ? 2 : 3}>
            {loadingProducts ? (
              <Grid item xs={12} display="flex" justifyContent="center"><CircularProgress /></Grid>
            ) : products.length === 0 ? (
              <Grid item xs={12}><Alert severity="info" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>No hay productos para mostrar</Alert></Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card>
                    <CardMedia component="img" sx={{ width: "100%", height: "100%", objectFit: "contain" }} image={product.image_base64} alt={product.name} />
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom sx={{ fontSize: isMobile ? '0.9rem' : '1.25rem' }}>{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{product.description}</Typography>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} color="primary" sx={{ fontSize: isMobile ? '0.95rem' : '1.25rem' }}>{product.price} {product.currency}</Typography>
                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        {product.has_delivery && (<Chip icon={<DeliveryIcon sx={{ fontSize: isMobile ? '0.7rem' : '1rem' }} />} label="Envío" size="small" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }} />)}
                        {product.has_pickup && (<Chip icon={<PickupIcon sx={{ fontSize: isMobile ? '0.7rem' : '1rem' }} />} label="Recogida" size="small" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }} />)}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Nombre del producto" name="name" value={formData.name} onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} required size={isMobile ? "small" : "medium"} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Código de producto (Opcional)" name="product_code" value={formData.product_code} onChange={handleInputChange} error={!!formErrors.product_code} helperText={formErrors.product_code} size={isMobile ? "small" : "medium"} /></Grid>
              <Grid item xs={12} sm={4}><FormControl fullWidth size={isMobile ? "small" : "medium"}><InputLabel>Categoría</InputLabel><Select name="category" value={formData.category} onChange={handleInputChange} label="Categoría">{categories.map((category) => (<MenuItem key={category.id} value={category.category}>{category.category}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12}><TextField fullWidth label="Descripción" name="description" multiline rows={isMobile ? 2 : 3} value={formData.description} onChange={handleInputChange} error={!!formErrors.description} helperText={formErrors.description} required size={isMobile ? "small" : "medium"} /></Grid>
              <Grid item xs={12} sm={8}><TextField fullWidth label="Precio" name="price" type="number" value={formData.price} onChange={handleInputChange} error={!!formErrors.price} helperText={formErrors.price} required inputProps={{ min: 0, step: 0.01 }} size={isMobile ? "small" : "medium"} /></Grid>
              <Grid item xs={12} sm={4}><FormControl fullWidth size={isMobile ? "small" : "medium"}><InputLabel>Moneda</InputLabel><Select name="currency" value={formData.currency} onChange={handleInputChange} label="Moneda"><MenuItem value="USD">USD</MenuItem><MenuItem value="CUP">CUP</MenuItem></Select></FormControl></Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={showDiscount} onChange={handleShowDiscountChange} name="showDiscount" size={isMobile ? "small" : "medium"} />}
                  label={<Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Añadir precio rebajado y período de oferta</Typography>}
                />
              </Grid>

              {showDiscount && (
                <>
                  <Grid item xs={12}>
                    {!editingProduct && (<Alert severity="warning" sx={{ mb: 2, fontSize: isMobile ? '0.75rem' : '0.85rem' }}>Manipular precios para aparentar grandes descuentos daña la confianza de los clientes. Mantenga precios reales y coherentes: la transparencia genera más ventas y fidelidad.</Alert>)}
                    <TextField fullWidth label="Nuevo Precio (Rebaja aplicada)" type="number" name="discount" value={formData.discount} onChange={handleInputChange} error={!!formErrors.discount} helperText={formErrors.discount} inputProps={{ min: 0, step: 0.01 }} size={isMobile ? "small" : "medium"} disabled={!formData.price || parseFloat(formData.price) <= 0} />
                    {formData.discount && formData.price && parseFloat(formData.discount) < (parseFloat(formData.price) / 2) && !formErrors.discount && (<FormHelperText sx={{ color: '#ed6c02', fontSize: isMobile ? '0.7rem' : '0.75rem', mt: 0.5 }}>⚠️ El descuento supera el 50% del precio original. Asegúrese de que esto sea intencional.</FormHelperText>)}
                  </Grid>

                  {formData.discount && parseFloat(formData.discount) > 0 && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DateTimePicker
                            label="Inicio de la oferta"
                            value={formData.discount_start_date}
                            onChange={(date) => handleDateChange('discount_start_date', date)}
                            minDateTime={!editingProduct ? now : undefined}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: isMobile ? "small" : "medium",
                                error: !!formErrors.discount_start_date,
                                helperText: formErrors.discount_start_date,
                                required: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DateTimePicker
                            label="Fin de la oferta"
                            value={formData.discount_end_date}
                            onChange={(date) => handleDateChange('discount_end_date', date)}
                            minDateTime={formData.discount_start_date || now}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: isMobile ? "small" : "medium",
                                error: !!formErrors.discount_end_date,
                                helperText: formErrors.discount_end_date,
                                required: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </>
                  )}
                </>
              )}

              <Grid item xs={12}><Box sx={{ border: '1px dashed #ccc', p: 2, textAlign: 'center' }}><input accept="image/*" style={{ display: 'none' }} id="image-upload" type="file" onChange={handleImageUpload} /><label htmlFor="image-upload"><Button variant="outlined" component="span" startIcon={<ImageIcon />} size={isMobile ? "small" : "medium"} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Subir Imagen</Button></label>{formErrors.image && (<Typography color="error" variant="caption" display="block" fontSize={isMobile ? '0.7rem' : '0.75rem'}>{formErrors.image}</Typography>)}{formData.image_base64 && (<Box sx={{ mt: 2 }}><img src={formData.image_base64} alt="Preview" style={{ maxWidth: isMobile ? 150 : 200, maxHeight: isMobile ? 150 : 200, objectFit: 'contain' }} /></Box>)}</Box></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '0.875rem' }}>Opciones de entrega:</Typography><Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}><FormControlLabel control={<Checkbox name="has_delivery" checked={formData.has_delivery} onChange={handleInputChange} disabled={formData.free_delivery} size={isMobile ? "small" : "medium"} />} label={<Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: formData.free_delivery ? 'text.disabled' : 'text.primary' }}>Mensajería/Envío a domicilio (costo adicional)</Typography>} /><FormControlLabel control={<Checkbox name="has_pickup" checked={formData.has_pickup} onChange={handleInputChange} disabled={formData.free_delivery} size={isMobile ? "small" : "medium"} />} label={<Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: formData.free_delivery ? 'text.disabled' : 'text.primary' }}>Recogida en tienda</Typography>} /><Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1, pt: 1 }}><FormControlLabel control={<Checkbox name="free_delivery" checked={formData.free_delivery} onChange={handleInputChange} disabled={formData.has_delivery || formData.has_pickup} size={isMobile ? "small" : "medium"} />} label={<Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: (formData.has_delivery || formData.has_pickup) ? 'text.disabled' : 'success.main', fontWeight: formData.free_delivery ? 600 : 400 }}>Entrega gratis (el vendedor entrega sin costo)</Typography>} /></Box></Box>{formErrors.delivery && (<Typography color="error" variant="caption" display="block" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem', mt: 1 }}>{formErrors.delivery}</Typography>)}</Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: "1.25rem" }}>
          <Button onClick={handleCloseDialog} color='error' variant='contained' size={isMobile ? "small" : "medium"} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting || !formIsValid} size={isMobile ? "small" : "medium"} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>{submitting ? (<CircularProgress size={isMobile ? 16 : 24} />) : ('Guardar')}</Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default StoreManagment;