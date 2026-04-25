import React, { useMemo, useState, useEffect } from 'react';
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
  useTheme,
  ThemeProvider,
  Alert
} from '@mui/material';

import {
  CheckCircle,
  TrendingUp,
  Star,
  Group,
  BarChart,
  HowToReg,
  ManageAccounts,
  Storefront,
  Receipt,
  Insights,
  AutoAwesome,
  AddShoppingCart,
  HelpOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useSnackbar } from '../context/Snackbar';
/* import { useMembers } from '../context/Context'; */
import DialogMessage from './DialogMessage';
import DowngradeStoreDialog from './DowngradeStoreDialog';
import { identifyAccountType } from '../services/accountType';
import {
  getSelectedPlanForUser,
  migrateLegacySelectedPlanForUser,
  setSelectedPlanForUser,
  markPlanStorageUser,
} from '../utils/planStorage';
import UpgradePremiumDialog from './UpgradePremiumDialog';
import { computePremiumUpgradePreview } from '../utils/premiumUpgrade';
import { ensureShopExists } from '../utils/ensureShopExists';
import { useAppTour } from "../tours/TourShell.jsx";
import { TOUR_IDS } from "../tours/registry.js";



const PlansPage = () => {
  const theme = useTheme();
  /* const { gymInfo } = useMembers(); */
  const { startTour, maybeAutoStartTour } = useAppTour();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openMessage, setOpenMessage] = useState(false);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [accountType, setAccountType] = useState('none');
  const [accountData, setAccountData] = useState({});
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [storedPlanId, setStoredPlanId] = useState(null);
  const [openDowngrade, setOpenDowngrade] = useState(false);
  const [authUserId, setAuthUserId] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);
  /* const [isLoading, setIsLoading] = useState(true); */

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const storedAccountType = localStorage.getItem('accountType');
    const inferredAccountType = storedAccountType === 'shop' || storedAccountType === 'gym' ? storedAccountType : 'gym';
    setAccountType(inferredAccountType);

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      setAuthUserId(userId ?? null);

      let planFromStorage = null;
      if (userId) {
        markPlanStorageUser(userId);
        planFromStorage = migrateLegacySelectedPlanForUser({ userId }) || getSelectedPlanForUser({ userId });
        setStoredPlanId(planFromStorage);
        if (planFromStorage) {
          setSelectedPlan(planFromStorage);
        }
      }

      const storageKey = inferredAccountType === 'shop' ? 'shop_info' : 'gym_info';
      try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
          setAccountData(JSON.parse(cached));
          return;
        }
      } catch (e) {
        console.error(e);
      }

      if (planFromStorage) {
        setAccountData(prev => ({
          ...prev,
          active: prev?.active ?? true,
          store: planFromStorage === 'premium'
        }));
        return;
      }

      if (userId) {
        const { type, data } = await identifyAccountType(userId);
        setAccountType(type);
        setAccountData(data);
      }
    };

    init();
  }, []);

  useEffect(() => {
    maybeAutoStartTour(TOUR_IDS.PLANS);
  }, [maybeAutoStartTour]);

  const premiumColor = isDark ? '#ffb777' : '#6164c7';
  const cardBgDark = 'linear-gradient(135deg, #1a2332 0%, #162131 100%)';
  const cardBgLight = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  const premiumBorderGradient = isDark ? 'linear-gradient(45deg, transparent, #ffb70044)' : 'linear-gradient(45deg, transparent, #6164c744)';

  const plans = [
    {
      id: 'estandar',
      name: 'Estándar',
      description: 'Ideal para gimnasios que desean gestionar sus operaciones de forma simple y eficiente.',
      originalPrice: 15,
      currentPrice: 12,
      discount: 20,
      renewalPrice: 15,
      renewalMonth: 3,
      features: [
        'El primer mes Gratis',
        'El segundo mes un 20% de descuento',
      ],
      includes: [
        { text: 'Registro de hasta 80 clientes (en promedio los gimnasios tienen 50-60 clientes)', icon: <Group /> },
        { text: 'Agregar y gestionar clientes y entrenadores', icon: <ManageAccounts /> },
        { text: 'Función de Checking en el gym (único en Cuba)', icon: <HowToReg /> },
        { text: 'Estadísticas generales (clientes, entrenadores, relaciones de agrupación)', icon: <BarChart /> },
        { text: 'Los clientes del gimnasio tendrán acceso a funciones IA en su aplicación de Tronoss para temas fitness (10 solicitudes)', icon: <AutoAwesome /> },
      ],
      color: '#6164c7',
      popular: false
    },
    {
      id: 'market-fit',
      name: 'Tienda Fitness',
      description: 'Diseñado para tiendas que quieren escalar y vender más fácil.',
      originalPrice: 15,
      currentPrice: 12,
      discount: 20,
      renewalPrice: 15,
      renewalMonth: 3,
      features: [
        'El primer mes Gratis',
        'El segundo mes un 20% de descuento',
      ],
      includes: [
        { text: 'Visibilidad directa en la comunidad fitness', icon: <TrendingUp /> },
        { text: 'Agregar productos en Tronoss', icon: <AddShoppingCart /> },
        { text: 'Catálogo de productos', icon: <Storefront /> },
        { text: 'Gestión de pedidos', icon: <Receipt /> },
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
        { text: 'Registro ilimitado de clientes', icon: <Group /> },
        { text: 'Agregar y gestionar clientes y entrenadores', icon: <ManageAccounts /> },
        { text: 'Función de Checking en el gym (único en Cuba)', icon: <HowToReg /> },
        { text: 'Los clientes del gimnasio tendrán acceso a funciones IA en su aplicación de Tronoss para temas fitness (40 solicitudes)', icon: <AutoAwesome /> },
        { text: 'Estadísticas generales (clientes, entrenadores, relaciones de agrupación)', icon: <BarChart /> },
        { text: 'Estadísticas de negocio y estratégicas (retención, ingresos proyectados, rango de edad, pagos y tendencias.)', icon: <Insights /> },
        { text: 'Visibilidad y posicionamiento en la comunidad fitness', icon: <Star /> },
        { text: 'Agregar productos en Tronoss', icon: <AddShoppingCart /> },
        { text: 'Catálogo de productos', icon: <Storefront /> },
        { text: 'Gestión de pedidos', icon: <Receipt /> },

      ],
      color: premiumColor,
      popular: true,
      fullFeatures: 'Incluye todas las funciones de los planes Estándar, Tienda Fitness y más.'
    }
  ];

  const handlePlanSelect = async (planId) => {
    setSelectedPlan(planId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const writeRes = setSelectedPlanForUser({ userId: user.id, planId });
    if (writeRes.ok) {
      setStoredPlanId(planId);
      showMessage("Plan seleccionado", "success");
    }

    const storedAccountType = localStorage.getItem('accountType');
    const inferredAccountType = accountType !== 'none'
      ? accountType
      : (storedAccountType === 'shop' || storedAccountType === 'gym' ? storedAccountType : 'gym');

    if (inferredAccountType === 'shop') {
      // Para tiendas
      if (planId === 'market-fit') {
        navigate('/shop-stepper', { state: { planId } });
      }
    } else {
      if (planId === 'estandar' || planId === 'premium') {
        navigate('/general_info', { state: { planId } });
      } else {
        navigate('/shop-stepper', { state: { planId } });
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
    }
  };
  const handlePlanChange = async (planId) => {
    const effectiveActive = accountData?.active ?? true;
    const effectiveStore = accountType === 'gym'
      ? (accountData?.store ?? (storedPlanId === 'premium'))
      : accountData?.store;

    if (accountType === 'gym' && effectiveActive && !effectiveStore && planId === 'premium') {
      setSelectedPlan(planId);
      setUpgradeDialogOpen(true);
      return;
    }

    if (accountType === 'gym' && effectiveActive && effectiveStore && planId === 'estandar') {
      setOpenDowngrade(true);
      return;
    }

    setSelectedPlan(planId);
    setOpenMessage(true);
  };

  const upgradePreview = useMemo(() => {
    if (accountType !== 'gym') return null;
    return computePremiumUpgradePreview({
      createdAt: accountData?.created_at,
      nextPaymentDate: accountData?.next_payment_date,
    });
  }, [accountData?.created_at, accountData?.next_payment_date, accountType]);

  const handleConfirmUpgrade = async () => {
    if (upgradeSubmitting) return;
    setUpgradeSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        showMessage('Usuario no autenticado', 'error');
        return;
      }

      const { data: gymRow, error: gymRowError } = await supabase
        .from('info_general_gym')
        .select('created_at, next_payment_date, additional_costs_amount')
        .eq('owner_id', userId)
        .maybeSingle();
      if (gymRowError) throw gymRowError;

      const computedPreview = computePremiumUpgradePreview({
        createdAt: gymRow?.created_at,
        nextPaymentDate: gymRow?.next_payment_date,
      });

      const existingAdditional = Number(gymRow?.additional_costs_amount ?? 0);
      const additionalNew = Math.round((existingAdditional + (computedPreview?.proratedDiff ?? 0)) * 100) / 100;
      const nextPaymentAmountNew = Math.round(((computedPreview?.premiumCost ?? 0) + additionalNew) * 100) / 100;

      const { error } = await supabase
        .from('info_general_gym')
        .update({
          store: true,
          additional_costs_amount: additionalNew,
          next_payment_amount: nextPaymentAmountNew,
        })
        .eq('owner_id', userId);

      if (error) throw error;

      await ensureShopExists({ userId, gymNextPaymentDate: accountData?.next_payment_date });
      setSelectedPlanForUser({ userId, planId: 'premium' });
      setStoredPlanId('premium');

      setAccountData(prev => ({
        ...prev,
        store: true,
        additional_costs_amount: additionalNew,
        next_payment_amount: nextPaymentAmountNew,
      }));

      try {
        const cached = sessionStorage.getItem('gym_info');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.store = true;
          parsed.additional_costs_amount = additionalNew;
          parsed.next_payment_amount = nextPaymentAmountNew;
          sessionStorage.setItem('gym_info', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error(e);
      }

      showMessage('Plan actualizado a Premium. La tienda está habilitada.', 'success');
      setUpgradeDialogOpen(false);
      navigate('/tienda-gym');
    } catch (e) {
      console.error(e);
      showMessage('No se pudo actualizar el plan. Intenta nuevamente.', 'error');
    } finally {
      setUpgradeSubmitting(false);
    }
  };

  const handleDowngradeCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSelectedPlan('estandar');
    const writeRes = setSelectedPlanForUser({ userId: user.id, planId: 'estandar' });
    if (writeRes.ok) {
      setStoredPlanId('estandar');
    }

    setAccountData(prev => ({
      ...prev,
      store: false,
    }));

    try {
      const cached = sessionStorage.getItem('gym_info');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.store = false;
        sessionStorage.setItem('gym_info', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    }

    navigate('/redirect');
  };

  const handlerSendMessage = () => {
    const phoneNumber = '+5355161765';
    const message = encodeURIComponent(`Me gustaría cambiar al plan ${(selectedPlan === 'estandar' ? 'Estandar' : selectedPlan === 'market-fit' ? 'Tienda Fitness' : 'Premium')}. Nombre de mi gimnasio: ${accountData?.gym_name}.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCloseMessage = () => {
    setOpenMessage(false);
  }

  const getButtonConfig = (planId) => {
    const effectiveActive = accountData?.active ?? true;
    const effectiveStore = accountType === 'gym'
      ? (accountData?.store ?? (storedPlanId === 'premium'))
      : accountData?.store;

    if (!effectiveActive) return { label: "Seleccionar", isActive: false };

    if (effectiveStore && accountType === 'gym') {
      // Tiene activa la tienda
      if (planId === "premium") return { label: "Plan activo", isActive: true };
      if (planId === "estandar") return { label: "Cambiar plan", isActive: false };
    } else if (accountType === 'gym') {
      if (planId === "estandar") return { label: "Plan activo", isActive: true };
      if (planId === "premium") return { label: "Cambiar plan", isActive: false };
    }

    return { label: "Seleccionar", isActive: false };
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #162131 0%, #1a2332 100%)'
          : 'linear-gradient(135deg, #fff 0%, #fff 100%)',
        py: 2
      }}>
        <Container maxWidth="lg">
          {accountType === 'shop' && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                backgroundColor: isDark ? '#1a2332' : '#e8f4fd',
                border: '1px solid #32aaf4',
                borderRadius: '8px'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Próximamente habrá un plan premium para tiendas
              </Typography>
              <Typography variant="body2">
                Actualmente estás usando el plan básico. Estamos trabajando en nuevas funcionalidades premium.
              </Typography>
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 6, mt: 1, px: { xs: 1, sm: 2 } }}>
            <Typography
              variant={"h4"}
              sx={{
                fontWeight: '900',
                color: isDark ? '#fff' : '#6164c7',
                mb: 2,
                lineHeight: 1.2,
                letterSpacing: '-0.5px'
              }}
            >
              Elige el plan perfecto para tu negocio
            </Typography>
            {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => startTour(TOUR_IDS.PLANS)}
                startIcon={<HelpOutline />}
                data-tour="plans-help"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`,
                  color: isDark ? '#fff' : '#6164c7',
                }}
              >
                ¿Cómo funciona?
              </Button>
            </Box> */}
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                color: isDark ? '#fff' : '#6164c7',
                opacity: 0.8,
                maxWidth: '600px',
                mx: 'auto',
                mb: 3
              }}
            >
              {!accountData?.active ? "No pierdas la oportunidad de unirte desde el principio" : "¡Felicidades! Ya formas parte de la historia que estamos construyendo en Cuba."}
            </Typography>
          </Box>

          {/* Plans Grid */}
          <Grid container spacing={3} sx={{ px: { xs: 1, sm: 2 }, mb: 6, display: 'grid', gridTemplateColumns: accountData?.active ? { xs: '1fr', md: '1fr 1fr' } : { xs: '1fr', md: '1fr 1fr 1fr' } }}>
            {plans.map((plan) => {
              const { label, isActive } = getButtonConfig(plan.id);

              const shouldRender =
                accountData?.active ? plan.id !== "market-fit" : true;

              if (!shouldRender) return null;
              return (
                (
                  <Grid item xs={12} md={accountData?.active ? 6 : 4} key={plan.id} sx={{ display: 'flex' }}>
                    <Card
                      data-tour={plan.id === 'premium' ? "plans-premium-card" : undefined}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        background: isDark ? cardBgDark : cardBgLight,
                        border: plan.popular
                          ? '2px solid transparent'
                          : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        backgroundClip: plan.popular ? 'padding-box' : 'border-box',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        transform: selectedPlan === plan.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: plan.popular
                          ? `0 12px 40px ${isDark ? 'rgba(255, 183, 0, 0.1)' : 'rgba(97, 100, 199, 0.2)'}`
                          : '0 4px 20px rgba(0, 0, 0, 0.1)',
                        '&::before': plan.popular ? {
                          content: '""',
                          position: 'absolute',
                          top: 0, right: 0, bottom: 0, left: 0,
                          zIndex: -1,
                          margin: '-2px',
                          borderRadius: 'inherit',
                          background: premiumBorderGradient,
                        } : {},
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: plan.popular
                            ? `0 16px 50px ${isDark ? 'rgba(255, 183, 0, 0.15)' : 'rgba(97, 100, 199, 0.3)'}`
                            : '0 12px 40px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      {(isActive || plan.id === 'premium') && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: '50%',
                            transform: 'translateX(-0%)',
                            background: isDark ? '#1a2332' : '#ffffff',
                            border: `2px solid ${plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color}`,
                            color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color,
                            px: 2,
                            py: 0.5,
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            boxShadow: `0 4px 10px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
                          }}
                        >
                          <Star sx={{ fontSize: '1rem' }} /> {isActive ? "PLAN ACTUAL" : "EL MÁS DESEADO"}
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1, p: 3, pb: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color,
                            mb: 0.5
                          }}
                        >
                          {plan.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
                            opacity: 0.8,
                            mb: 2,
                            lineHeight: 1.4,
                            minHeight: '40px'
                          }}
                        >
                          {plan.description}
                        </Typography>

                        {/* Pricing */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: 'line-through',
                                color: isDark ? 'rgba(255,255,255,0.6)' : theme.palette.text.secondary,
                                opacity: 0.6
                              }}
                            >
                              ${plan.originalPrice} USD
                            </Typography>
                            <Chip
                              label={`Ahorras ${plan.discount}%`}
                              size="small"
                              sx={{
                                background: 'transparent',
                                border: `1px solid ${plan.popular ? (isDark ? '#ffb700' : '#6164c7') : (isDark ? '#e49c10' : '#ff416c')}`,
                                color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : (isDark ? '#e49c10' : '#ff416c'),
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                height: '18px',
                                letterSpacing: '0.5px'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: '900',
                                color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color,
                                fontSize: '2.5rem',
                                letterSpacing: '-1px'
                              }}
                            >
                              ${plan.currentPrice}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: isDark ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
                                opacity: 0.8,
                                fontSize: '1rem',
                                fontWeight: '500'
                              }}
                            >
                              USD/ 2do mes
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: isDark ? 'rgba(255,255,255,0.6)' : theme.palette.text.secondary,
                              opacity: 0.7,
                              mt: 0.5
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
                            mb: 1,
                            color: isDark ? 'white' : theme.palette.text.primary,
                            fontSize: '1.25rem'
                          }}
                        >
                          Todo lo que ganas al registrarte
                        </Typography>

                        <List dense sx={{ mb: 2, p: 0 }} className='bg-slate-200/5 rounded'>
                          {plan.features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 1, py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircle sx={{ color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : '#4caf50', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: isDark ? 'rgba(255,255,255,0.8)' : theme.palette.text.secondary,
                                  sx: { opacity: 0.9, fontSize: '1rem', lineHeight: 1.2 }
                                }}
                              />
                            </ListItem>
                          ))}

                        </List>

                        {/* Includes */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: isDark ? 'white' : theme.palette.text.primary,
                            fontSize: '0.85rem'
                          }}
                        >
                          {plan.fullFeatures || 'Incluye:'}
                        </Typography>

                        <List dense sx={{ p: 0 }}>
                          {plan.includes.map((item, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                {React.cloneElement(item.icon, { sx: { color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : '#4caf50', fontSize: 16 } })}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                  variant: 'caption',
                                  color: isDark ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
                                  sx: { opacity: 0.8, fontSize: '0.75rem', lineHeight: 1.2 }
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
                          onClick={() =>
                            !isActive &&
                            (accountData?.active
                              ? handlePlanChange(plan.id)
                              : handlePlanSelect(plan.id))
                          }
                          data-tour={plan.id === 'premium' ? "plans-premium-cta" : undefined}
                          sx={{
                            py: 1.5,
                            background: plan.popular
                              ? 'transparent'
                              : 'transparent',
                            border: `2px solid ${plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color}`,
                            color: plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color,
                            fontWeight: '900',
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            opacity: 1,
                            cursor: isActive ? 'no-drop' : 'pointer',
                            boxShadow: plan.popular && !isActive ? `0 8px 20px ${isDark ? 'rgba(255, 183, 0, 0.15)' : 'rgba(97, 100, 199, 0.15)'}` : 'none',
                            transition: 'all 0.2s',
                            '&:hover': !isActive && {
                              background: plan.popular
                                ? (isDark ? 'rgba(255, 183, 0, 0.1)' : 'rgba(97, 100, 199, 0.1)')
                                : (isDark ? `${plan.color}20` : `${plan.color}10`),
                              transform: 'translateY(-2px)',
                              border: `2px solid ${plan.popular ? (isDark ? '#ffb700' : '#6164c7') : plan.color}`,
                              boxShadow: plan.popular ? `0 12px 24px ${isDark ? 'rgba(255, 183, 0, 0.25)' : 'rgba(97, 100, 199, 0.25)'}` : 'none'
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
            msg={`¿Estás seguro que deseas cambiar de plan? El cambio se aplicará en tu próximo ciclo de facturación que comienza el día ` + (accountData?.next_payment_date ? new Date(accountData?.next_payment_date).toLocaleDateString() : '') + '.'}
          />

          <UpgradePremiumDialog
            open={upgradeDialogOpen}
            onOpenChange={setUpgradeDialogOpen}
            preview={upgradePreview}
            submitting={upgradeSubmitting}
            onConfirm={handleConfirmUpgrade}
          />

          <DowngradeStoreDialog
            open={openDowngrade}
            onOpenChange={setOpenDowngrade}
            userId={authUserId}
            gymName={accountData?.gym_name}
            onCompleted={handleDowngradeCompleted}
            showMessage={showMessage}
            onGoToOrders={() => navigate('/tienda-gym')}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PlansPage;
