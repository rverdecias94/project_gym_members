/* eslint-disable react/prop-types */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMembers } from "../context/Context";
import { supabase } from "../supabase/client";
import moment from "moment/moment";
import { toast } from "sonner";
import { CircleHelp, Plus, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DialogMessage from './DialogMessage';
import SettingsAccountShop from "./SettingsAccountShop";
import {
  setSelectedPlanForUser,
} from "../utils/planStorage";

import { computePremiumUpgradePreview, formatUsd } from "../utils/premiumUpgrade";
import { ensureShopExists } from "../utils/ensureShopExists";
import StoreFiltersCard from "./store/StoreFiltersCard";
import ProductsTab from "./store/ProductsTab";
import OrdersTab from "./store/OrdersTab";
import ProductUpsertDialog from "./store/ProductUpsertDialog";
import CancelOrderDialog from "./store/CancelOrderDialog";
import GymStoreStatsTab from "./store/GymStoreStatsTab";
import GymStoreNotEnabledView from "./store/GymStoreNotEnabledView";
import { useAppTour } from "../tours/TourShell.jsx";
import { TOUR_IDS } from "../tours/registry.js";

const StoreManagmentGym = () => {
  const { getGymInfo, getAuthUser } = useMembers();
  const { startTour, maybeAutoStartTour } = useAppTour();
  const [store, setStore] = useState(false);
  const [gymInfoData, setGymInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);

  const isMobile = window.innerWidth <= 768;
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    if (!loading && store) {
      maybeAutoStartTour(TOUR_IDS.STORE_GYM, {
        setTabValue,
        openFilters: () => setShowFiltersMobile(true),
      });
    }
  }, [loading, maybeAutoStartTour, store]);

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [filterProductDate, setFilterProductDate] = useState("");

  const [filterOrderClient, setFilterOrderClient] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("all");
  const [filterOrderProduct, setFilterOrderProduct] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterOrderDate, setFilterOrderDate] = useState("");

  const upgradePreview = useMemo(() => {
    if (!gymInfoData) return null;
    return computePremiumUpgradePreview({
      createdAt: gymInfoData?.created_at,
      nextPaymentDate: gymInfoData?.next_payment_date,
      today: moment(),
    });
  }, [gymInfoData]);

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

  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const getChartOptions = (categories, isPie = false, customColors = null) => {
    const textColor = isDarkMode ? "hsl(215 20.2% 65.1%)" : "#64748b";
    const primaryTextColor = isDarkMode ? "hsl(210 40% 98%)" : "#0f172a";

    const baseOptions = {
      chart: {
        toolbar: { show: false },
        background: "transparent",
        fontFamily: "Montserrat, sans-serif",
      },
      colors: customColors || ["#6164c7", "#e49c10", "#ef74b9", "#10b981"],
      theme: {
        mode: isDarkMode ? "dark" : "light",
      },
      tooltip: {
        theme: isDarkMode ? "dark" : "light",
        style: {
          fontSize: "12px",
          fontFamily: "Montserrat, sans-serif",
        },
      },
    };

    if (isPie) {
      return {
        ...baseOptions,
        labels: categories,
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: {
          position: "bottom",
          labels: { colors: textColor },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
              labels: {
                show: true,
                name: { color: textColor },
                value: { color: primaryTextColor, fontSize: "20px", fontWeight: 600 },
              },
            },
          },
        },
      };
    }

    return {
      ...baseOptions,
      xaxis: {
        categories,
        labels: {
          style: { colors: textColor },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: textColor },
        },
      },
      grid: {
        borderColor: isDarkMode ? "hsl(var(--border))" : "rgba(0,0,0,0.05)",
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "40%",
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
    };
  };

  const storeStats = useMemo(() => {
    const statusLabels = ["Recibida", "Procesada", "Entregada", "Cancelada"];
    const ordersByStatus = statusLabels.map((_, idx) => orders.filter((o) => o.status === idx).length);

    const deliveredOrders = orders.filter((o) => o.status === 2);
    const incomeByCurrency = deliveredOrders.reduce((acc, o) => {
      const currency = o.currency || "USD";
      const raw = o.price_total ?? o.price ?? 0;
      const value = typeof raw === "number" ? raw : parseFloat(raw);
      if (!Number.isFinite(value)) return acc;
      acc[currency] = (acc[currency] || 0) + value;
      return acc;
    }, {});

    const categoriesMap = products.reduce((acc, p) => {
      const key = (p.category || "").trim() || "Sin categoría";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const categoryEntries = Object.entries(categoriesMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const maxBars = 8;
    const main = categoryEntries.slice(0, maxBars);
    const rest = categoryEntries.slice(maxBars);
    const restTotal = rest.reduce((sum, e) => sum + e.total, 0);

    const categoryChart = [
      ...main,
      ...(restTotal > 0 ? [{ name: "Otros", total: restTotal }] : []),
    ];

    // Nuevos cálculos para gráficos adicionales
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Productos olvidados (disponibles pero sin ventas en el último mes)
    const forgottenProducts = products.filter(product => {
      const hasSales = orders.some(order =>
        order.status === 2 && // Entregadas
        new Date(order.created_at) >= oneMonthAgo &&
        order.products?.some(p => p.id_products === product.id_products)
      );
      return !hasSales && new Date(product.created_at) <= oneMonthAgo;
    });

    // Ranking de productos por ventas
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.status === 2 && order.products) { // Solo órdenes entregadas
        order.products.forEach(product => {
          const id = product.id_products;
          productSalesMap[id] = (productSalesMap[id] || 0) + (product.quantity || 1);
        });
      }
    });

    const productRanking = products
      .map(product => ({
        ...product,
        totalSales: productSalesMap[product.id_products] || 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10); // Top 10 productos

    // Predicción simple: categoría con más ventas históricas
    const categorySalesMap = {};
    orders.forEach(order => {
      if (order.status === 2 && order.products) {
        order.products.forEach(product => {
          const productData = products.find(p => p.id_products === product.id_products);
          if (productData) {
            const category = productData.category || "Sin categoría";
            categorySalesMap[category] = (categorySalesMap[category] || 0) + (product.quantity || 1);
          }
        });
      }
    });

    const topCategory = Object.entries(categorySalesMap)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "Sin datos";

    // Alertas inteligentes
    const alerts = [];

    // Ventas de esta semana vs semana pasada
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekSales = orders.filter(o =>
      o.status === 2 &&
      new Date(o.created_at) >= oneWeekAgo
    ).length;

    const lastWeekSales = orders.filter(o =>
      o.status === 2 &&
      new Date(o.created_at) >= twoWeeksAgo &&
      new Date(o.created_at) < oneWeekAgo
    ).length;

    if (thisWeekSales < lastWeekSales * 0.8) {
      alerts.push("Tus ventas bajaron esta semana");
    }

    // Productos en crecimiento (más ventas esta semana que la semana pasada)
    const growingProducts = products.filter(product => {
      const thisWeekProductSales = orders.filter(order =>
        order.status === 2 &&
        new Date(order.created_at) >= oneWeekAgo &&
        order.products?.some(p => p.id_products === product.id_products)
      ).reduce((sum, order) => {
        const productInOrder = order.products?.find(p => p.id_products === product.id_products);
        return sum + (productInOrder?.quantity || 0);
      }, 0);

      const lastWeekProductSales = orders.filter(order =>
        order.status === 2 &&
        new Date(order.created_at) >= twoWeeksAgo &&
        new Date(order.created_at) < oneWeekAgo &&
        order.products?.some(p => p.id_products === product.id_products)
      ).reduce((sum, order) => {
        const productInOrder = order.products?.find(p => p.id_products === product.id_products);
        return sum + (productInOrder?.quantity || 0);
      }, 0);

      return thisWeekProductSales > lastWeekProductSales * 1.5;
    });

    if (growingProducts.length > 0) {
      alerts.push(`Este producto está creciendo rápido: ${growingProducts[0]?.name_products || "Producto"}`);
    }

    return {
      totalOrders: orders.length,
      totalProducts: products.length,
      deliveredOrdersCount: deliveredOrders.length,
      incomeByCurrency,
      statusLabels,
      ordersByStatus,
      categoryChart,
      // Nuevos datos
      forgottenProducts,
      productRanking,
      topCategory,
      alerts,
      thisWeekSales,
      lastWeekSales,
      growingProducts
    };
  }, [orders, products]);

  const getProducts = useCallback(() => {
    setLoadingProducts(true);

    setTimeout(async () => {
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
        toast.error('Error al cargar productos');
      } finally {
        setLoadingProducts(false);
      }
    }, 500);
  }, [getAuthUser]);

  const getOrders = useCallback(async () => {
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
      toast.error('Error al cargar órdenes');
    } finally {
      setLoadingOrders(false);
    }
  }, [getAuthUser]);

  const getGymInfoRef = useRef(getGymInfo);
  const getProductsRef = useRef(getProducts);
  const getOrdersRef = useRef(getOrders);

  useEffect(() => {
    getGymInfoRef.current = getGymInfo;
  }, [getGymInfo]);

  useEffect(() => {
    getProductsRef.current = getProducts;
  }, [getProducts]);

  useEffect(() => {
    getOrdersRef.current = getOrders;
  }, [getOrders]);

  const hasLoadedInitialDataRef = useRef(false);

  useEffect(() => {
    if (hasLoadedInitialDataRef.current) return;
    hasLoadedInitialDataRef.current = true;

    const getData = async () => {
      try {
        let data = await getGymInfoRef.current();
        if (!data) {
          setLoading(false);
          return;
        }
        setGymInfoData(data);
        const storeEnabled = data?.store === true;
        setStore(storeEnabled);
        if (storeEnabled) {
          await getProductsRef.current();
          await getOrdersRef.current();
          let result = await supabase.from('categories').select('*');
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error getting gym info:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleConfirmUpgrade = async () => {
    if (upgradeSubmitting) return;
    setUpgradeSubmitting(true);
    try {
      const { data: { user } } = await getAuthUser();
      const userId = user?.id;
      if (!userId) {
        toast.error("Usuario no autenticado");
        return;
      }

      const { data: gymRow, error: gymRowError } = await supabase
        .from("info_general_gym")
        .select("created_at, next_payment_date, additional_costs_amount")
        .eq("owner_id", userId)
        .maybeSingle();
      if (gymRowError) throw gymRowError;

      const computedPreview = computePremiumUpgradePreview({
        createdAt: gymRow?.created_at,
        nextPaymentDate: gymRow?.next_payment_date,
        today: moment(),
      });

      const existingAdditional = Number(gymRow?.additional_costs_amount ?? 0);
      const additionalNew = Math.round((existingAdditional + (computedPreview?.proratedDiff ?? 0)) * 100) / 100;
      const nextPaymentAmountNew = Math.round(((computedPreview?.premiumCost ?? 0) + additionalNew) * 100) / 100;

      const { error } = await supabase
        .from("info_general_gym")
        .update({
          store: true,
          additional_costs_amount: additionalNew,
          next_payment_amount: nextPaymentAmountNew,
        })
        .eq("owner_id", userId);

      if (error) throw error;

      await ensureShopExists({ userId, gymNextPaymentDate: gymInfoData?.next_payment_date });
      setSelectedPlanForUser({ userId, planId: "premium" });

      const updatedGymInfo = {
        ...(gymInfoData || {}),
        store: true,
        additional_costs_amount: additionalNew,
        next_payment_amount: nextPaymentAmountNew,
      };
      setGymInfoData(updatedGymInfo);
      setStore(true);
      try {
        sessionStorage.setItem("gym_info", JSON.stringify(updatedGymInfo));
      } catch {
        return;
      }

      await getProducts();
      await getOrders();
      const result = await supabase.from("categories").select("*");
      setCategories(result.data || []);

      toast.success("Plan actualizado a Premium. La tienda está habilitada.");
      setUpgradeDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el plan. Intenta nuevamente.");
    } finally {
      setUpgradeSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

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
      toast.success('Estado actualizado');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar el estado');
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
      toast.success('Orden cancelada');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo cancelar la orden');
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

  const validateForm = useCallback((data = formData, updateErrors = true) => {
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
  }, [formData, showDiscount]);

  useEffect(() => {
    if (openDialog) {
      validateForm(formData, false); // Do not update errors initially
    }
  }, [formData, openDialog, showDiscount, validateForm]);

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
        toast.success('Producto actualizado exitosamente');
      } else {
        productData.enable = true;
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success('Producto creado exitosamente');
      }
      handleCloseDialog();
      await getProducts();
    } catch (error) {
      if (error.code === '23505') {
        toast.error('Ya existe un producto con ese código. Por favor, use un código diferente o déjelo vacío.');
      } else {
        toast.error('Error al guardar el producto: ' + (error.message || 'Error desconocido'));
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
      toast.success('Producto eliminado exitosamente');
      await getProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
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
      enable: true,
    });
    setFormErrors({});
  };

  const handleWhatsAppRequest = () => {
    const phoneNumber = "56577410";
    const message = encodeURIComponent(
      "¡Hola! Me interesa habilitar la funcionalidad de tienda para mi gimnasio."
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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

  if (!store && !loading) {
    return (
      <GymStoreNotEnabledView
        upgradePreview={upgradePreview}
        upgradeDialogOpen={upgradeDialogOpen}
        setUpgradeDialogOpen={setUpgradeDialogOpen}
        upgradeSubmitting={upgradeSubmitting}
        onConfirmUpgrade={handleConfirmUpgrade}
        onWhatsAppRequest={handleWhatsAppRequest}
        formatUsd={formatUsd}
      />
    );
  }

  if (showSettings) {
    return (
      <div className="max-w-[1400px] mx-auto mt-[8rem] mb-8 px-4">
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={() => setShowSettings(false)}>
            &larr; Volver a Gestión de Tienda
          </Button>
        </div>
        <SettingsAccountShop isFromGym={true} handleClose={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto mt-[8rem] mb-8 px-4 flex flex-col md:flex-row gap-4 pb-24 md:pb-0">
        {isMobile && (
          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowFiltersMobile((prev) => !prev)}
              data-tour="store-filters-toggle"
            >
              {showFiltersMobile ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </div>
        )}

        {(showFiltersMobile || !isMobile) && (
          <div className="flex flex-col gap-4 mb-6 md:w-1/4 h-auto">
            <StoreFiltersCard
              loading={loading}
              tabValue={tabValue}
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterDelivery={filterDelivery}
              setFilterDelivery={setFilterDelivery}
              filterProductDate={filterProductDate}
              setFilterProductDate={setFilterProductDate}
              filterOrderClient={filterOrderClient}
              setFilterOrderClient={setFilterOrderClient}
              filterOrderStatus={filterOrderStatus}
              setFilterOrderStatus={setFilterOrderStatus}
              filterOrderProduct={filterOrderProduct}
              setFilterOrderProduct={setFilterOrderProduct}
              filterOrderId={filterOrderId}
              setFilterOrderId={setFilterOrderId}
              filterOrderDate={filterOrderDate}
              setFilterOrderDate={setFilterOrderDate}
            />
          </div>
        )}

        <Card className="p-4 md:p-6 md:w-3/4 shadow-sm border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">
              Gestión de Tienda
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() =>
                  startTour(TOUR_IDS.STORE_GYM, {
                    setTabValue,
                    openFilters: () => setShowFiltersMobile(true),
                  })
                }
              >
                <CircleHelp className=" h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurar Perfil
              </Button>
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
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
          </div>

          <Tabs
            value={tabValue.toString()}
            onValueChange={(v) => setTabValue(parseInt(v))}
            className="w-full"
          >
            <TabsList data-tour="store-tabs" className="grid w-full grid-cols-3 md:w-[560px] mb-6">
              <TabsTrigger value="0" data-tour="store-tab-products">
                Lista de Productos
              </TabsTrigger>
              <TabsTrigger value="1" data-tour="store-tab-orders">
                Órdenes
              </TabsTrigger>
              <TabsTrigger value="3" data-tour="store-tab-stats">
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="0" className="mt-4" data-tour="store-products-area">
              <ProductsTab
                isMobile={isMobile}
                loading={loading || loadingProducts}
                products={currentProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => handlePageChange(null, page)}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </TabsContent>

            <TabsContent value="3" className="mt-4 pb-24 md:pb-0" data-tour="store-stats-area">
              <GymStoreStatsTab storeStats={storeStats} getChartOptions={getChartOptions} />
            </TabsContent>

            <TabsContent value="1" className="mt-4" data-tour="store-orders-area">
              <OrdersTab
                isMobile={isMobile}
                loading={loadingOrders}
                orders={filteredOrders}
                ordersPage={ordersPage}
                ordersItemsPerPage={ordersItemsPerPage}
                onOrdersPageChange={setOrdersPage}
                mapPurchaseType={mapPurchaseType}
                mapStatus={mapStatus}
                getStatusBadgeProps={getStatusBadgeProps}
                statusUpdatingId={statusUpdatingId}
                onChangeOrderStatus={handleChangeOrderStatus}
              />
            </TabsContent>

          </Tabs>
        </Card>
      </div>

      <ProductUpsertDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        showDiscount={showDiscount}
        formErrors={formErrors}
        submitting={submitting}
        formIsValid={formIsValid}
        submitButtonClassName="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto font-semibold"
        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        handleShowDiscountChange={handleShowDiscountChange}
        handleDateChange={handleDateChange}
        validateForm={validateForm}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
      />

      <CancelOrderDialog
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
        cancelReason={cancelReason}
        onCancelReasonChange={(e) => setCancelReason(e.target.value)}
        onClose={() => {
          setOpenCancelDialog(false);
          setCancelOrder(null);
          setCancelReason('');
        }}
        onConfirm={confirmCancelOrder}
      />

      {/* Modal de confirmación para eliminar producto */}
      <DialogMessage
        open={deleteDialogOpen}
        handleClose={() => { setDeleteDialog(false); setProductToDelete(null); }}
        fn={handleConfirmDelete}
        title="Eliminar Producto"
        msg="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default StoreManagmentGym;
