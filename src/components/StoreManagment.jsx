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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Columna izquierda - Información principal */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <StoreIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h4" gutterBottom color="text.primary">
                  Tienda no habilitada
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Tu gimnasio no tiene habilitada la funcionalidad de tienda.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsAppRequest}
                  sx={{
                    backgroundColor: '#25d366',
                    '&:hover': {
                      backgroundColor: '#20b358',
                    },
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    mb: 2
                  }}
                >
                  Solicitar servicio por WhatsApp
                </Button>

                <Typography variant="caption" color="text.secondary" display="block">
                  Te contactaremos para procesar tu solicitud y activar tu tienda
                </Typography>
              </Box>
            </Grid>

            {/* Columna derecha - Información del servicio */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  border: '1px solid #9c27b0'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ color: '#7b1fa2', fontWeight: 'bold' }}>
                  🛍️ Habilita tu tienda virtual
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a148c', mb: 3 }}>
                  Vende productos directamente desde tu plataforma de gimnasio con nuestra funcionalidad de tienda integrada.
                </Typography>

                <Grid container spacing={3}>
                  {/* Precio */}
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'white' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        $5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        USD/mes
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Beneficios en grid horizontal */}
                  <Grid item xs={12} sm={8}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Catálogo ilimitado</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Gestión de inventario</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Entregas flexibles</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Múltiples monedas</Typography>
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestión de Tienda
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nuevo Producto
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Lista de Productos" />
          <Tab label="Catálogo" />
        </Tabs>

        {tabValue === 0 && (
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

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {loadingProducts ? (
              <Grid item xs={12} display="flex" justifyContent="center">
                <CircularProgress />
              </Grid>
            ) : products.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No hay productos para mostrar</Alert>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image_base64}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {product.price} {product.currency}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        {product.has_delivery && (
                          <Chip icon={<DeliveryIcon />} label="Envío" size="small" />
                        )}
                        {product.has_pickup && (
                          <Chip icon={<PickupIcon />} label="Recogida" size="small" />
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  required
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
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
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
                    >
                      Subir Imagen
                    </Button>
                  </label>
                  {formErrors.image && (
                    <Typography color="error" variant="caption" display="block">
                      {formErrors.image}
                    </Typography>
                  )}
                  {formData.image_base64 && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={formData.image_base64}
                        alt="Preview"
                        style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Opciones de entrega:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_delivery}
                      onChange={(e) => setFormData(prev => ({ ...prev, has_delivery: e.target.checked }))}
                    />
                  }
                  label="Mensajería/Envío a domicilio"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_pickup}
                      onChange={(e) => setFormData(prev => ({ ...prev, has_pickup: e.target.checked }))}
                    />
                  }
                  label="Recogida en tienda"
                />
                {formErrors.delivery && (
                  <Typography color="error" variant="caption" display="block">
                    {formErrors.delivery}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : (editingProduct ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreManagment;