import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  IconButton,
  useTheme,
  ThemeProvider
} from '@mui/material';

import {
  ArrowBack,
  CheckCircle,
  WhatsApp,
  FitnessCenter,
  TrendingUp,
  Star,
  Group,
  BarChart,
  Support,
  Inventory,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useSnackbar } from '../context/Snackbar';
import { useMembers } from '../context/Context';
import DialogMessage from './DialogMessage';



const PlansPage = () => {
  const theme = useTheme();
  const { gymInfo } = useMembers();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openMessage, setOpenMessage] = useState(false);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const plans = [
    {
      id: 'estandar',
      name: 'Estándar',
      description: 'Ideal para gimnasios que desean gestionar sus operaciones de forma simple y eficiente.',
      originalPrice: 15,
      currentPrice: 10.50,
      discount: 30,
      renewalPrice: 15,
      renewalMonth: 4,
      features: [
        'El primer mes Gratis',
        'El segundo y tercer mes un 30% de descuento',
      ],
      includes: [
        { text: 'Agregar y gestionar miembros y entrenadores', icon: <Group /> },
        { text: 'Función de Checking en el gym (único en Cuba)', icon: <FitnessCenter /> },
        { text: 'Estadísticas del gimnasio, miembros y fechas de pago', icon: <BarChart /> },
      ],
      color: '#6164c7',
      popular: false
    },
    {
      id: 'market-fit',
      name: 'Tienda Fitness',
      description: 'Diseñado para tiendas que quieren escalar y vender más fácil.',
      originalPrice: 15,
      currentPrice: 10.50,
      discount: 30,
      renewalPrice: 15,
      renewalMonth: 4,
      features: [
        'El primer mes Gratis',
        'El segundo y tercer mes un 30% de descuento',
      ],
      includes: [
        { text: 'Visibilidad directa en la comunidad fitness', icon: <TrendingUp /> },
        { text: 'Agregar productos en Tronoss', icon: <Inventory /> },
        { text: 'Catálogo de productos', icon: <Business /> },
        { text: 'Gestión de pedidos', icon: <Support /> },
        { text: 'Posicionamiento como líder en el mercado fitness', icon: <Star /> }
      ],
      color: '#32aaf4',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Desarrollado para negocios que combinan gimnasio y tienda para dominar el mercado fitness.',
      originalPrice: 28,
      currentPrice: 19.60,
      discount: 30,
      renewalPrice: 28,
      renewalMonth: 4,
      features: [
        'El primer mes Gratis',
        'El segundo y tercer mes un 30% de descuento',
      ],
      includes: [
        { text: 'Agregar y gestionar miembros y entrenadores', icon: <Group /> },
        { text: 'Función de Checking en el gym (único en Cuba)', icon: <FitnessCenter /> },
        { text: 'Estadísticas del gimnasio, miembros y fechas de pago', icon: <BarChart /> },
        { text: 'Visibilidad y posicionamiento en la comunidad fitness', icon: <Star /> },
        { text: 'Agregar productos en Tronoss', icon: <Inventory /> },
        { text: 'Catálogo de productos', icon: <Business /> },
        { text: 'Gestión de pedidos', icon: <Support /> },
      ],
      color: '#6164c7',
      popular: true,
      fullFeatures: 'Incluye todo de los Gym Master y Market Fit'
    }
  ];

  const handlePlanSelect = async (planId) => {
    setSelectedPlan(planId);
    if (planId === 'estandar' || planId === 'premium') {
      navigate('/general_info', { state: { planId } });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    if (user) {
      const { data } = await supabase
        .from("info_general_gym")
        .update({ store: planId === "premium" ? true : false })
        .eq("owner_id", user.id);
      if (data) {
        showMessage("Plan actualizado correctamente", "success");
        navigate('/redirect');
      }
    }
  };
  const handlePlanChange = async (planId) => {
    setSelectedPlan(planId);
    setOpenMessage(true);
  };

  const handlerSendMessage = () => {
    const phoneNumber = '+5356408532';
    const message = encodeURIComponent(`Me gustaría cambiar al plan ${(selectedPlan === 'estandar' ? 'Estandar' : selectedPlan === 'market-fit' ? 'Tienda Fitness' : 'Premium')}. Nombre de mi gimnasio: ${gymInfo.gym_name}.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleCloseMessage = () => {
    setOpenMessage(false);
  }

  const getButtonConfig = (planId) => {
    if (!gymInfo.active) return { label: "Seleccionar", isActive: false };

    if (gymInfo.store) {
      // Tiene activa la tienda
      if (planId === "premium") return { label: "Plan activo", isActive: true };
      if (planId === "estandar") return { label: "Cambiar plan", isActive: false };
    } else {
      // No tiene tienda activa
      if (planId === "estandar") return { label: "Plan activo", isActive: true };
      if (planId === "premium") return { label: "Cambiar plan", isActive: false };
    }

    return { label: "Seleccionar", isActive: false };
  };




  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #162131 0%, #1a2332 100%)'
          : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        py: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            px: { xs: 1, sm: 2 }
          }}>
            <IconButton
              onClick={handleGoBack}
              sx={{
                color: '#6164c7',
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(97, 100, 199, 0.1)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 4, px: { xs: 1, sm: 2 } }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? "white" : theme.palette.primary.main,
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Elige el plan perfecto para tu negocio
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                color: theme.palette.mode === 'dark' ? "white" : theme.palette.primary.main,
                opacity: 0.8,
                maxWidth: '600px',
                mx: 'auto',
                mb: 3
              }}
            >
              Estamos haciendo historia en Cuba. No pierdas la oportunidad de unirte desde el principio.
            </Typography>
          </Box>

          {/* Plans Grid */}
          <Grid container spacing={3} sx={{ px: { xs: 1, sm: 2 }, mb: 6 }}>
            {plans.map((plan) => {
              const { label, isActive } = getButtonConfig(plan.id);

              const shouldRender =
                gymInfo.active ? plan.id !== "market-fit" : true;

              if (!shouldRender) return null;
              return (
                (
                  <Grid item xs={12} md={gymInfo.active ? 6 : 4} key={plan.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, #1a2332 0%, #162131 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: plan.popular
                          ? '2px solid #6164c7'
                          : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        transform: selectedPlan === plan.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: plan.popular
                          ? '0 8px 32px rgba(97, 100, 199, 0.3)'
                          : '0 4px 20px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      {plan.popular && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -1,
                            right: 16,
                            background: 'linear-gradient(45deg, #6164c7, #56d1cb)',
                            color: 'white',
                            px: 2,
                            py: 1,
                            borderRadius: '0 0 12px 12px',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            zIndex: 1
                          }}
                        >
                          El más deseado
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            color: plan.color,
                            mb: 1
                          }}
                        >
                          {plan.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            opacity: 0.8,
                            mb: 3,
                            lineHeight: 1.5
                          }}
                        >
                          {plan.description}
                        </Typography>

                        {/* Pricing */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: 'line-through',
                                color: theme.palette.text.secondary,
                                opacity: 0.6
                              }}
                            >
                              ${plan.originalPrice} USD
                            </Typography>
                            <Chip
                              label={`Ahorras ${plan.discount}%`}
                              size="small"
                              sx={{
                                background: 'linear-gradient(45deg, #6164c7, #56d1cb)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 'bold',
                                color: plan.color
                              }}
                            >
                              {plan.currentPrice}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: theme.palette.text.secondary,
                                opacity: 0.8
                              }}
                            >
                              USD/mes
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: theme.palette.text.secondary,
                              opacity: 0.7,
                              mt: 1
                            }}
                          >
                            Se renueva a {plan.renewalPrice} USD/mes a partir del {plan.renewalMonth}to mes
                          </Typography>
                        </Box>

                        {/* Features */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            color: theme.palette.text.primary
                          }}
                        >
                          Todo lo que ganas al registrarte
                        </Typography>

                        <List dense sx={{ mb: 3 }}>
                          {plan.features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle sx={{ color: '#4caf50', fontSize: 18 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: theme.palette.text.secondary,
                                  sx: { opacity: 0.9, fontSize: '0.875rem' }
                                }}
                              />
                            </ListItem>
                          ))}
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <WhatsApp sx={{ color: '#25d366', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Soporte técnico vía WhatsApp"
                              primaryTypographyProps={{
                                variant: 'body2',
                                color: theme.palette.text.secondary,
                                sx: { opacity: 0.9, fontSize: '0.875rem' }
                              }}
                            />
                          </ListItem>
                        </List>

                        {/* Includes */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            color: theme.palette.text.primary
                          }}
                        >
                          {plan.fullFeatures || 'Incluye:'}
                        </Typography>

                        <List dense>
                          {plan.includes.map((item, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                {React.cloneElement(item.icon, { sx: { color: '#4caf50', fontSize: 16 } })}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                  variant: 'caption',
                                  color: theme.palette.text.secondary,
                                  sx: { opacity: 0.8, fontSize: '0.8rem' }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>

                      <Box sx={{ p: 3, pt: 0 }}>

                        <Button
                          fullWidth
                          variant={plan.popular ? "contained" : "outlined"}
                          size="large"
                          disabled={isActive}
                          onClick={() =>
                            !isActive &&
                            (gymInfo.active
                              ? handlePlanChange(plan.id)
                              : handlePlanSelect(plan.id))
                          }
                          sx={{
                            py: 2,
                            background: plan.popular
                              ? `linear-gradient(45deg, ${plan.color}, #56d1cb)`
                              : 'transparent',
                            border: `2px solid ${plan.color}`,
                            color: plan.popular ? 'white' : plan.color,
                            fontWeight: 'bold',
                            borderRadius: 2,
                            fontSize: '1rem',
                            textTransform: 'none',
                            opacity: isActive ? 0.6 : 1,
                            cursor: isActive ? 'not-allowed' : 'pointer',
                            '&:hover': !isActive && {
                              background: plan.popular
                                ? `linear-gradient(45deg, ${plan.color}dd, #56d1cbdd)`
                                : `${plan.color}10`,
                              transform: 'translateY(-1px)',
                              border: `2px solid ${plan.color}`
                            }
                          }}
                        >
                          {label}
                        </Button>

                      </Box>
                    </Card>
                  </Grid>
                ))
            })}
          </Grid>
          <DialogMessage
            handleClose={handleCloseMessage}
            info={null}
            title="Cambiar Plan"
            fn={handlerSendMessage}
            open={openMessage}
            msg={`¿Estás seguro que deseas cambiar de plan? El cambio se aplicará en tu próximo ciclo de facturación que comienza el día ` + (gymInfo.next_payment_date ? new Date(gymInfo.next_payment_date).toLocaleDateString() : '') + '.'}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PlansPage;