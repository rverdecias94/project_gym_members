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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  LocalShipping as DeliveryIcon,
  Store as PickupIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckIcon,
  StorefrontOutlined as StoreIcon
} from "@mui/icons-material";

const StoreManagment = () => {
  const { getGymInfo } = useMembers();
  const [store, setStore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Estados para productos
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados para paginación móvil
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
    has_pickup: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const getData = async () => {
      try {
        let data = await getGymInfo();
        setStore(data.store);
        if (data.store) {
          await getProducts();
        }
      } catch (error) {
        console.error('Error getting gym info:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when products change
  }, [products]);

  const getProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('gym_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error al cargar productos');
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

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.description.trim()) errors.description = 'La descripción es requerida';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (!formData.product_code.trim()) errors.product_code = 'El código de producto es requerido';
    if (!formData.image_base64) errors.image = 'La imagen es requerida';
    if (!formData.has_delivery && !formData.has_pickup) {
      errors.delivery = 'Debe seleccionar al menos una opción de entrega';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        gym_id: user.id
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Producto actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('Producto creado exitosamente');
      }

      handleCloseDialog();
      await getProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.code === '23505') {
        alert('Ya existe un producto con ese código');
      } else {
        alert('Error al guardar el producto');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      image_base64: product.image_base64,
      product_code: product.product_code,
      has_delivery: product.has_delivery,
      has_pickup: product.has_pickup
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Producto eliminado exitosamente');
      await getProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      image_base64: '',
      product_code: '',
      has_delivery: false,
      has_pickup: false
    });
    setFormErrors({});
  };

  const handleWhatsAppRequest = () => {
    const phoneNumber = "56577410";
    const message = encodeURIComponent(
      "¡Hola! Me interesa habilitar la funcionalidad de tienda para mi gimnasio. Quisiera solicitar información sobre el servicio adicional de $5 USD. ¡Gracias!"
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calcular elementos para la página actual en vista móvil
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Componente para mostrar productos en tarjetas móviles
  const ProductCard = ({ product }) => (
    <Card sx={{ mb: 10, boxShadow: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="120"
          image={product.image_base64}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
          <strong>Código:</strong> {product.product_code}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', lineHeight: 1.3 }}>
          {product.description.length > 80 ? `${product.description.substring(0, 80)}...` : product.description}
        </Typography>

        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>
          {product.price} {product.currency}
        </Typography>

        <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
          {product.has_delivery && (
            <Chip
              icon={<DeliveryIcon sx={{ fontSize: '0.7rem' }} />}
              label="Envío"
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
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1 }}>
        <IconButton
          color="primary"
          onClick={() => handleEdit(product)}
          size="small"
        >
          <EditIcon sx={{ fontSize: '1.1rem' }} />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDelete(product.id)}
          size="small"
        >
          <DeleteIcon sx={{ fontSize: '1.1rem' }} />
        </IconButton>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!store) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: isMobile ? 2 : 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <StoreIcon sx={{ fontSize: isMobile ? 40 : 48, color: 'grey.400', mb: 2 }} />
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom color="text.primary">
                  Tienda no habilitada
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  Tu gimnasio no tiene habilitada la funcionalidad de tienda.
                </Typography>

                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<WhatsAppIcon sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }} />}
                  onClick={handleWhatsAppRequest}
                  sx={{
                    backgroundColor: '#25d366',
                    '&:hover': {
                      backgroundColor: '#20b358',
                    },
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 2 : 4,
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    mb: 2
                  }}
                  fullWidth={isMobile}
                >
                  Solicitar servicio por WhatsApp
                </Button>

                <Typography variant="caption" color="text.secondary" display="block" fontSize={isMobile ? '0.7rem' : '0.75rem'}>
                  Te contactaremos para procesar tu solicitud y activar tu tienda
                </Typography>
              </Box>
            </Grid>

            {/* Columna derecha - Información del servicio */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={2}
                sx={{
                  p: isMobile ? 2 : 3,
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  border: '1px solid #9c27b0'
                }}
              >
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ color: '#7b1fa2', fontWeight: 'bold' }}>
                  🛍️ Habilita tu tienda virtual
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a148c', mb: 3, fontSize: isMobile ? '0.85rem' : '1rem' }}>
                  Vende productos directamente desde tu plataforma de gimnasio con nuestra funcionalidad de tienda integrada.
                </Typography>

                <Grid container spacing={3}>
                  {/* Precio */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'white' }}>
                      <Typography variant={isMobile ? "h5" : "h4"} color="success.main" sx={{ fontWeight: 'bold' }}>
                        $5
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize={isMobile ? '0.7rem' : '0.875rem'}>
                        USD/mes
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Beneficios en grid horizontal */}
                  <Grid item xs={12} sm={8}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                          <Typography variant="body2" fontSize={isMobile ? '0.7rem' : '0.875rem'}>Catálogo ilimitado</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                          <Typography variant="body2" fontSize={isMobile ? '0.7rem' : '0.875rem'}>Gestión de inventario</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                          <Typography variant="body2" fontSize={isMobile ? '0.7rem' : '0.875rem'}>Entregas flexibles</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                          <Typography variant="body2" fontSize={isMobile ? '0.7rem' : '0.875rem'}>Múltiples monedas</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 16 }}>
      <Paper sx={{ p: isMobile ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 2 : 0}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Gestión de Tienda
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }} />}
            onClick={() => setOpenDialog(true)}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}
          >
            Nuevo Producto
          </Button>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              minWidth: isMobile ? 'auto' : 160
            }
          }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Lista de Productos" />
          <Tab label="Catálogo" />
        </Tabs>

        {tabValue === 0 && (
          <>
            {!isMobile && (
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
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No hay productos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Box sx={{ width: 50, height: 50 }}>
                              <img
                                src={product.image_base64}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 4
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.product_code}</TableCell>
                          <TableCell>
                            {product.price} {product.currency}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              {product.has_delivery && (
                                <Chip icon={<DeliveryIcon />} label="Envío" size="small" />
                              )}
                              {product.has_pickup && (
                                <Chip icon={<PickupIcon />} label="Recogida" size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEdit(product)} color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(product.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Vista móvil - Tarjetas */}
            {isMobile && (
              <Box sx={{ width: '100%' }}>
                {loadingProducts ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : products.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4, fontSize: '0.9rem' }}>
                    No hay productos registrados
                  </Typography>
                ) : (
                  <>
                    {currentProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}

                    {/* Paginación para vista móvil */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="small"
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Grid container spacing={isMobile ? 2 : 3}>
            {loadingProducts ? (
              <Grid item xs={12} display="flex" justifyContent="center">
                <CircularProgress />
              </Grid>
            ) : products.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  No hay productos para mostrar
                </Alert>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      /* height={isMobile ? "150" : "200"} */
                      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                      image={product.image_base64}
                      alt={product.name}
                    />
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant={isMobile ? "subtitle2" : "h6"} gutterBottom sx={{ fontSize: isMobile ? '0.9rem' : '1.25rem' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        {product.description}
                      </Typography>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} color="primary" sx={{ fontSize: isMobile ? '0.95rem' : '1.25rem' }}>
                        {product.price} {product.currency}
                      </Typography>
                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        {product.has_delivery && (
                          <Chip
                            icon={<DeliveryIcon sx={{ fontSize: isMobile ? '0.7rem' : '1rem' }} />}
                            label="Envío"
                            size="small"
                            sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                          />
                        )}
                        {product.has_pickup && (
                          <Chip
                            icon={<PickupIcon sx={{ fontSize: isMobile ? '0.7rem' : '1rem' }} />}
                            label="Recogida"
                            size="small"
                            sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Paper>

      {/* Dialog para crear/editar productos */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del producto"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código de producto"
                  value={formData.product_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                  error={!!formErrors.product_code}
                  helperText={formErrors.product_code}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={isMobile ? 2 : 3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    label="Moneda"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="CUP">CUP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ border: '1px dashed #ccc', p: 2, textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      size={isMobile ? "small" : "medium"}
                      sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                    >
                      Subir Imagen
                    </Button>
                  </label>
                  {formErrors.image && (
                    <Typography color="error" variant="caption" display="block" fontSize={isMobile ? '0.7rem' : '0.75rem'}>
                      {formErrors.image}
                    </Typography>
                  )}
                  {formData.image_base64 && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={formData.image_base64}
                        alt="Preview"
                        style={{
                          maxWidth: isMobile ? 150 : 200,
                          maxHeight: isMobile ? 150 : 200,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '0.875rem' }}>
                  Opciones de entrega:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_delivery}
                      onChange={(e) => setFormData(prev => ({ ...prev, has_delivery: e.target.checked }))}
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                      Mensajería/Envío a domicilio
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_pickup}
                      onChange={(e) => setFormData(prev => ({ ...prev, has_pickup: e.target.checked }))}
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                      Recogida en tienda
                    </Typography>
                  }
                />
                {formErrors.delivery && (
                  <Typography color="error" variant="caption" display="block" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                    {formErrors.delivery}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
          <Button
            onClick={handleCloseDialog}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
          >
            {submitting ? (
              <CircularProgress size={isMobile ? 16 : 24} />
            ) : (
              editingProduct ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreManagment;