import { useCallback, useEffect, useState } from "react";
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { useSnackbar } from "../context/Snackbar";
import AdminRaffle from "./AdminRaffle";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ReactApexChart from 'react-apexcharts';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from "@/components/ui/date-picker";
import { RefreshCw, Search, Trash2, FileText, CreditCard } from "lucide-react";
import { computeGymNextBillingAmount, roundMoney } from "../utils/gymBilling";

const AdminPanel = () => {
  const [gymInfo, setGymInfo] = useState([]);
  const [gymInfoOriginal, setGymInfoOriginal] = useState([]);
  const [shopInfo, setShopInfo] = useState([]);
  const [shopInfoOriginal, setShopInfoOriginal] = useState([]);

  const [search, setSearchTerm] = useState("");
  const [rotate, setRotate] = useState(false);
  const [tabValue, setTabValue] = useState("gyms");

  const { showMessage } = useSnackbar();
  const [openPayment, setOpenPayment] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedType, setSelectedType] = useState('gym');
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentNextDate, setPaymentNextDate] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("Standard");
  const [expectedPaymentAmount, setExpectedPaymentAmount] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [aiRequestsDraft, setAiRequestsDraft] = useState({});
  const [aiRequestsSaving, setAiRequestsSaving] = useState({});
  const [extrasDraft, setExtrasDraft] = useState({});
  const [extrasSaving, setExtrasSaving] = useState({});
  const [statistics, setStatistics] = useState({
    gymsByProvince: {},
    shopsByProvince: {},
    clientsByGym: {},
    membersByGymName: {},
    upcomingPayments: [],
    premiumGyms: 0,
    standardGyms: 0,
    shops: 0,
    shopsWithProducts: {},
    totalProductsByShop: {},
    shopWithMostProducts: null,
    totalGyms: 0,
    totalShops: 0,
    totalProducts: 0
  });

  const [monthlyIncome, setMonthlyIncome] = useState({
    gym: Array(12).fill(0),
    shop: Array(12).fill(0)
  });
  const [incomeCurrency, setIncomeCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);
  const selectedYear = new Date().getFullYear().toString();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const getAllGyms = useCallback(async () => {
    setRotate(true);
    try {
      const { data, error } = await supabase.from('info_general_gym').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGymInfo(data || []);
      setAiRequestsDraft({});
      setAiRequestsSaving({});
      setGymInfoOriginal(data || []);
      showMessage("Listado de gimnasios actualizado", "success");
    } catch (err) {
      console.error("Error fetching gyms:", err);
      showMessage("Error cargando listado de gimnasios", "error");
    } finally {
      setTimeout(() => setRotate(false), 1000);
    }
  }, [showMessage]);

  const getAllShops = useCallback(async () => {
    setRotate(true);
    try {
      const { data, error } = await supabase.from('info_shops').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setShopInfo(data || []);
      setShopInfoOriginal(data || []);
      showMessage("Listado de tiendas actualizado", "success");
    } catch (err) {
      console.error("Error fetching shops:", err);
      showMessage("Error cargando listado de tiendas", "error");
    } finally {
      setTimeout(() => setRotate(false), 1000);
    }
  }, [showMessage]);

  const getStatistics = useCallback(async () => {
    try {
      const { data: gymsData } = await supabase.from('info_general_gym').select('*');
      const { data: shopsData } = await supabase.from('info_shops').select('*');
      const { data: productsData } = await supabase.from('products').select('user_store_id');


      const storeNamesMap = {};
      const gymsNamesMap = {};

      gymsData?.forEach(gym => {
        if (gym.owner_id) gymsNamesMap[gym.owner_id] = gym.gym_name;
      });
      shopsData?.forEach(shop => {
        if (shop.owner_id) storeNamesMap[shop.owner_id] = shop.shop_name;
      });

      const gymsByProvince = {};
      gymsData?.forEach(gym => {
        const province = gym.state;
        gymsByProvince[province] = (gymsByProvince[province] || 0) + 1;
      });

      const shopsByProvince = {};
      shopsData?.forEach(shop => {
        const province = shop.state;
        shopsByProvince[province] = (shopsByProvince[province] || 0) + 1;
      });

      const clientsByGym = {};
      gymsData?.forEach(gym => {
        if (gym.owner_id) {
          clientsByGym[gym.owner_id] = gym.clients;
        }
      });

      const membersByGymName = {};
      Object.entries(clientsByGym).forEach(([gymId, count]) => {
        const gymName = gymsNamesMap[gymId];
        membersByGymName[gymName] = count;
      });

      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      const upcomingPayments = [];

      const checkUpcoming = (item, type) => {
        if (item.next_payment_date) {
          const payDate = dayjs(item.next_payment_date);
          if (payDate.isAfter(startOfWeek.subtract(1, 'day')) && payDate.isBefore(endOfWeek.add(1, 'day'))) {
            upcomingPayments.push({
              id: item.owner_id,
              name: item.gym_name || item.shop_name,
              type: type,
              date: item.next_payment_date
            });
          }
        }
      };

      gymsData?.forEach(gym => checkUpcoming(gym, 'Gimnasio'));
      shopsData?.forEach(shop => checkUpcoming(shop, 'Tienda'));
      upcomingPayments.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

      let premiumGyms = 0;
      let standardGyms = 0;
      let shops = shopsData?.length || 0;

      gymsData?.forEach(gym => {
        if (gym.store) premiumGyms++;
        else standardGyms++;
      });

      const productsByShop = {};
      productsData?.forEach(product => {
        const shopId = product.user_store_id;
        if (shopId) {
          const storeName = storeNamesMap[shopId] || 'Tienda Desconocida';
          productsByShop[storeName] = (productsByShop[storeName] || 0) + 1;
        }
      });

      let shopWithMostProducts = null;
      let maxProducts = 0;
      Object.entries(productsByShop).forEach(([storeName, count]) => {
        if (count > maxProducts) {
          maxProducts = count;
          shopWithMostProducts = storeName;
        }
      });

      console.log(clientsByGym)

      setStatistics({
        gymsByProvince,
        shopsByProvince,
        clientsByGym,
        membersByGymName,
        upcomingPayments,
        premiumGyms,
        standardGyms,
        shops,
        shopsWithProducts: productsByShop,
        totalProductsByShop: productsByShop,
        shopWithMostProducts,
        totalGyms: gymsData?.length || 0,
        totalShops: shopsData?.length || 0,
        totalProducts: productsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      showMessage('Error al cargar estadísticas', 'error');
    }
  }, [showMessage]);

  const updateNextPaymentDate = async (row, newDate, dataType) => {
    const tableName = dataType === 'gym' ? 'info_general_gym' : 'info_shops';
    const nextDateValue = newDate ? dayjs(newDate).format("YYYY-MM-DD") : null;
    const updatePayload = { next_payment_date: nextDateValue };

    if (dataType === 'gym' && nextDateValue) {
      const expectedNext = computeGymNextBillingAmount({
        createdAt: row.created_at,
        nextPaymentDate: nextDateValue,
        isPremium: row.store === true,
        additionalCostsAmount: row.additional_costs_amount ?? 0,
      });
      updatePayload.next_payment_amount = expectedNext;
    }

    try {
      if (!row.owner_id) return;
      const { error } = await supabase.from(tableName).update(updatePayload).eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Fecha de pago actualizada con éxito!", "success");
      if (dataType === 'gym') getAllGyms(); else getAllShops();
    } catch (error) {
      showMessage("Error al actualizar la fecha de pago.", "error");
    }
  };
  const updateRequests = async (row) => {
    try {
      if (!row.owner_id) return;
      const draftValue = aiRequestsDraft[row.owner_id];
      if (draftValue === undefined || !/^\d+$/.test(String(draftValue))) {
        showMessage("Valor inválido para Solicitud AI", "error");
        return;
      }
      const newValue = parseInt(draftValue, 10);
      setAiRequestsSaving(prev => ({ ...prev, [row.owner_id]: true }));
      const { error } = await supabase
        .from("info_general_gym")
        .update({ ai_available_requests: newValue })
        .eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Solicitud de AI actualizada!", "success");
      setGymInfo(prev => prev.map(g => g.owner_id === row.owner_id ? { ...g, ai_available_requests: newValue } : g));
      setGymInfoOriginal(prev => prev.map(g => g.owner_id === row.owner_id ? { ...g, ai_available_requests: newValue } : g));
      setAiRequestsDraft(prev => {
        const next = { ...prev };
        delete next[row.owner_id];
        return next;
      });
    } catch (error) {
      showMessage("Error al actualizar la solicitud.", "error");
    } finally {
      setAiRequestsSaving(prev => ({ ...prev, [row.owner_id]: false }));
    }
  };

  const updateExtras = async (row) => {
    try {
      if (!row.owner_id) return;
      const draftValue = extrasDraft[row.owner_id];
      if (draftValue === undefined) return;
      const normalized = String(draftValue).replace(',', '.').trim();
      if (normalized === '' || !/^\d+(\.\d{0,2})?$/.test(normalized)) {
        showMessage("Valor inválido para Extras", "error");
        return;
      }
      const newValue = roundMoney(parseFloat(normalized));

      setExtrasSaving(prev => ({ ...prev, [row.owner_id]: true }));
      const nextPaymentAmount = computeGymNextBillingAmount({
        createdAt: row.created_at,
        nextPaymentDate: row.next_payment_date,
        isPremium: row.store === true,
        additionalCostsAmount: newValue,
      });

      const { error } = await supabase
        .from("info_general_gym")
        .update({
          additional_costs_amount: newValue,
          next_payment_amount: nextPaymentAmount,
        })
        .eq("owner_id", row.owner_id);
      if (error) throw error;

      showMessage("¡Extras actualizados!", "success");
      const patchRow = (g) => g.owner_id === row.owner_id
        ? { ...g, additional_costs_amount: newValue, next_payment_amount: nextPaymentAmount }
        : g;
      setGymInfo(prev => prev.map(patchRow));
      setGymInfoOriginal(prev => prev.map(patchRow));
      setExtrasDraft(prev => {
        const next = { ...prev };
        delete next[row.owner_id];
        return next;
      });
    } catch (error) {
      console.error(error);
      showMessage("Error al actualizar Extras.", "error");
    } finally {
      setExtrasSaving(prev => ({ ...prev, [row.owner_id]: false }));
    }
  };

  const loadMonthlyIncome = useCallback(async () => {
    try {
      const currentYear = parseInt(selectedYear);

      // Obtener pagos de gimnasios
      const { data: payments, error: gymError } = await supabase
        .from('payment_history_customer')
        .select('quantity_paid, currency, next_payment_date, active_plan')
        .gte('next_payment_date', `${currentYear}-01-01`)
        .lte('next_payment_date', `${currentYear}-12-31`);

      if (gymError) {
        console.error('Error al cargar pagos de gimnasios:', gymError);
        return;
      }
      // Procesar pagos por mes y tipo
      const gymIncomeByMonth = Array(12).fill(0);
      const shopIncomeByMonth = Array(12).fill(0);
      const standardIncomeByMonth = Array(12).fill(0);
      const currenciesFound = new Set(['USD']);

      // Procesar pagos de gimnasios
      payments?.forEach(payment => {
        const paymentDate = new Date(payment.next_payment_date);
        const month = paymentDate.getMonth() - 1;
        const amount = parseFloat(payment.quantity_paid) || 0;
        const currency = payment.currency;

        currenciesFound.add(currency);

        if (payment.active_plan === 'Premium') {
          gymIncomeByMonth[month] += amount;
        } else if (payment.active_plan === 'Standard') {
          standardIncomeByMonth[month] += amount;
        } else if (payment.active_plan === 'Store') {
          shopIncomeByMonth[month] += amount;
        }
      });

      setMonthlyIncome({
        gym: gymIncomeByMonth,
        shop: shopIncomeByMonth,
        standard: standardIncomeByMonth
      });

      setAvailableCurrencies(Array.from(currenciesFound).sort());

    } catch (error) {
      console.error('Error al cargar ingresos mensuales:', error);
      showMessage('Error al cargar ingresos mensuales', 'error');
    }
  }, [selectedYear, showMessage]);

  useEffect(() => {
    loadMonthlyIncome();
  }, [loadMonthlyIncome]);

  const fetchAllData = useCallback(() => {
    getAllGyms();
    getAllShops();
    getStatistics();
    loadMonthlyIncome();
  }, [getAllGyms, getAllShops, getStatistics, loadMonthlyIncome]);

  useEffect(() => {
    fetchAllData();
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [fetchAllData]);

  const updateActiveStatus = async (row, dataType) => {
    const tableName = dataType === 'gym' ? 'info_general_gym' : 'info_shops';
    const updatedRow = { ...row, active: !row.active };
    try {
      if (!row.owner_id) return;
      const { error } = await supabase.from(tableName).update(updatedRow).eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Estado actualizado con éxito!", "success");
      if (dataType === 'gym') {
        setGymInfo(prev => prev.map(g => g.owner_id === row.owner_id ? updatedRow : g));
      } else {
        setShopInfo(prev => prev.map(s => s.owner_id === row.owner_id ? updatedRow : s));
      }
    } catch (error) {
      showMessage("Error al actualizar el estado.", "error");
      console.error(error);
    }
  };

  const updateStoreActivation = async (row) => {
    const updatedRow = { ...row, store: !row.store };
    const nextPaymentAmount = computeGymNextBillingAmount({
      createdAt: row.created_at,
      nextPaymentDate: row.next_payment_date,
      isPremium: updatedRow.store === true,
      additionalCostsAmount: row.additional_costs_amount ?? 0,
    });
    try {
      if (!row.owner_id) return;
      const { error } = await supabase
        .from("info_general_gym")
        .update({
          store: updatedRow.store,
          next_payment_amount: nextPaymentAmount,
        })
        .eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Estado de la tienda actualizado!", "success");
      setGymInfo(prev => prev.map(g => g.owner_id === row.owner_id ? { ...updatedRow, next_payment_amount: nextPaymentAmount } : g));
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPayment = (row) => {
    setSelectedGym(row);
    setSelectedType(tabValue === 'gyms' ? 'gym' : 'shop');
    const expected = tabValue === 'gyms'
      ? roundMoney(row?.next_payment_amount ?? computeGymNextBillingAmount({
        createdAt: row.created_at,
        nextPaymentDate: row.next_payment_date,
        isPremium: row.store === true,
        additionalCostsAmount: row.additional_costs_amount ?? 0,
      }))
      : null;
    setExpectedPaymentAmount(expected);
    setPaymentAmount(expected !== null && expected !== undefined ? String(expected) : "");
    setPaymentCurrency("USD");
    setPaymentNextDate(row?.next_payment_date ? dayjs(row.next_payment_date).add(1, 'month').format('YYYY-MM-DD') : "");
    setPaymentPlan(row?.store ? "Premium" : "Standard");
    setOpenPayment(true);
  };

  const handleSavePayment = async () => {
    if (!selectedGym || !paymentAmount || !paymentCurrency) {
      showMessage("Complete los campos requeridos", "error");
      return;
    }
    setSavingPayment(true);
    try {
      if (selectedType === 'gym') {
        const paid = roundMoney(parseFloat(paymentAmount));
        if (!Number.isFinite(paid) || paid <= 0) {
          showMessage('Monto inválido', 'error');
          return;
        }
        const newNextPaymentDate = paymentNextDate ? dayjs(paymentNextDate).format('YYYY-MM-DD') : null;
        if (!newNextPaymentDate) {
          showMessage('Seleccione la próxima fecha de pago', 'error');
          return;
        }

        const { data, error } = await supabase.rpc('process_gym_payment', {
          p_uid_customer: selectedGym.owner_id,
          p_amount: paid,
          p_currency: paymentCurrency,
          p_new_next_payment_date: newNextPaymentDate,
        });

        if (error) {
          if (error.message?.includes('amount_mismatch')) {
            showMessage('Monto incorrecto. Debe pagar exactamente el monto esperado.', 'error');
            return;
          }
          if (error.message?.includes('duplicate_payment')) {
            showMessage('Ya existe un pago registrado para este período', 'error');
            return;
          }
          if (error.message?.includes('not_authorized')) {
            showMessage('No autorizado para registrar pagos', 'error');
            return;
          }
          throw error;
        }

        if (!data?.ok) {
          showMessage('No se pudo procesar el pago', 'error');
          return;
        }

        showMessage('Pago registrado', 'success');
        setOpenPayment(false);
        setSelectedGym(null);
        await getAllGyms();
        return;
      }
      await updateNextPaymentDate(selectedGym, paymentNextDate, selectedType);
      const payload = {
        uid_customer: selectedGym.owner_id,
        quantity_paid: parseFloat(paymentAmount),
        currency: paymentCurrency,
        next_payment_date: paymentNextDate ? dayjs(paymentNextDate).format("YYYY-MM-DD") : null,
        active_plan: selectedType === 'gym' ? paymentPlan : 'Store',
      };
      const { error } = await supabase.from('payment_history_customer').insert(payload);
      if (error) throw error;
      showMessage("Pago registrado", "success");
      setOpenPayment(false);
      setSelectedGym(null);
    } catch (err) {
      console.error(err);
      showMessage("Error registrando pago", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleOpenHistory = async (row) => {
    setSelectedGym(row);
    setOpenHistory(true);
    try {
      const { data, error } = await supabase
        .from('payment_history_customer')
        .select('*')
        .eq('uid_customer', row.owner_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHistoryRows(data || []);
    } catch (err) {
      console.error(err);
      showMessage("Error cargando historial", "error");
    }
  };

  const handleOpenConfirm = (item) => {
    setItemToDelete(item);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setItemToDelete(null);
    setOpenConfirm(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const type = tabValue === 'gyms' ? 'gym' : 'shop';
    const tableName = type === 'gym' ? 'info_general_gym' : 'info_shops';

    try {
      const { error } = await supabase.from(tableName).delete().eq('owner_id', itemToDelete.owner_id);
      if (error) throw error;
      showMessage("Cuenta eliminada con éxito", "success");
      if (type === 'gym') {
        getAllGyms();
      } else {
        getAllShops();
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      showMessage("Error al eliminar la cuenta", "error");
    } finally {
      handleCloseConfirm();
    }
  };

  const handleTabChange = (value) => {
    setTabValue(value);
    setSearchTerm("");
    setGymInfo(gymInfoOriginal);
    setShopInfo(shopInfoOriginal);
    if (value === "statistics") {
      getStatistics();
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === '') {
      if (tabValue === "gyms") setGymInfo(gymInfoOriginal);
      else setShopInfo(shopInfoOriginal);
      return;
    }

    const source = tabValue === "gyms" ? gymInfoOriginal : shopInfoOriginal;
    const filteredData = source.filter(item =>
      (item.gym_name || item.shop_name)?.toLowerCase().includes(value) ||
      item.address?.toLowerCase().includes(value) ||
      item.owner_name?.toLowerCase().includes(value) ||
      item.city?.toLowerCase().includes(value)
    );
    if (tabValue === "gyms") setGymInfo(filteredData);
    else setShopInfo(filteredData);
  };

  const isNewRow = (row) => {
    const propertiesToCheck = ['gym_name', 'address', 'owner_name', 'owner_phone', 'public_phone', 'state', 'city'];
    return row.active === null && propertiesToCheck.some(prop => row[prop]?.includes('DEFAULT_'));
  };

  const isOverdue = (row) => {
    return dayjs(row.next_payment_date).isBefore(dayjs(), 'day');
  };

  const getRowClassName = (row) => {
    if (isNewRow(row)) return 'bg-emerald-100 dark:bg-emerald-950/30';
    if (isOverdue(row)) return 'bg-red-100 dark:bg-red-950/30';
    return '';
  };

  const getChartOptions = (categories, isPie = false, customColors = null) => {
    const textColor = isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b';

    const baseOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Montserrat, sans-serif',
      },
      colors: customColors || ['#6157d6', '#f278b6', '#1da274', '#ed6c02'],
      theme: {
        mode: isDarkMode ? 'dark' : 'light',
      },
      tooltip: {
        theme: isDarkMode ? 'dark' : 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Montserrat, sans-serif'
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
          position: 'bottom',
          labels: { colors: textColor }
        },
      };
    }

    return {
      ...baseOptions,
      xaxis: {
        categories,
        labels: { style: { colors: textColor } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        show: false,
      },
      grid: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
    };
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Panel de Administración</h2>

        {tabValue !== "raffles" && tabValue !== "statistics" && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar en ${tabValue === 'gyms' ? 'Gimnasios' : 'Tiendas'}`}
              value={search}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
        )}
      </div>

      <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
          <TabsTrigger value="gyms">Gimnasios</TabsTrigger>
          <TabsTrigger value="shops">Tiendas</TabsTrigger>
          <TabsTrigger value="raffles">Sorteos</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="gyms">
          <div className="md:hidden space-y-4">
            {gymInfo.map((gym) => (
              <Card key={gym.owner_id} className={getRowClassName(gym)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{gym.gym_name}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {gym.owner_name} • {dayjs(gym.created_at).format('DD/MM/YYYY')}
                      </div>
                    </div>
                    <Badge className="shrink-0" variant={gym.store ? "default" : "secondary"}>
                      {gym.store ? "PRO" : "STD"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Teléfono</span>
                      <span className="text-foreground">{gym.owner_phone || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Prov/Mun</span>
                      <span className="text-foreground">{[gym.state || "-", gym.city || "-"]?.filter(Boolean).join(" / ")}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Próxima facturación</span>
                      <span className="text-foreground">
                        {(() => {
                          const payment = roundMoney(gym.next_payment_amount ?? computeGymNextBillingAmount({
                            createdAt: gym.created_at,
                            nextPaymentDate: gym.next_payment_date,
                            isPremium: gym.store === true,
                            additionalCostsAmount: gym.additional_costs_amount ?? 0,
                          }));
                          return payment > 0 ? `${payment.toFixed(2)} USD` : "-";
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Fecha de pago</div>
                      <DatePicker
                        value={gym.next_payment_date ? dayjs(gym.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(val) => updateNextPaymentDate(gym, val, 'gym')}
                        buttonClassName="w-full h-9"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Activo</span>
                      <Switch checked={gym.active || false} onCheckedChange={() => updateActiveStatus(gym, 'gym')} />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <Switch checked={gym.store || false} onCheckedChange={() => updateStoreActivation(gym)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Solicitud AI</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={aiRequestsDraft[gym.owner_id] ?? String(gym.ai_available_requests ?? "")}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            if (nextValue === "" || /^\d+$/.test(nextValue)) {
                              setAiRequestsDraft(prev => ({ ...prev, [gym.owner_id]: nextValue }));
                            }
                          }}
                          className="h-9"
                        />
                        <Button
                          variant="secondary"
                          className="h-9"
                          disabled={
                            aiRequestsSaving[gym.owner_id] ||
                            aiRequestsDraft[gym.owner_id] === undefined ||
                            String(aiRequestsDraft[gym.owner_id]) === String(gym.ai_available_requests ?? "") ||
                            !/^\d+$/.test(String(aiRequestsDraft[gym.owner_id]))
                          }
                          onClick={() => updateRequests(gym)}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Extras</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={extrasDraft[gym.owner_id] ?? String(gym.additional_costs_amount ?? 0)}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            if (nextValue === "" || /^\d+(?:[.,]\d{0,2})?$/.test(nextValue)) {
                              setExtrasDraft(prev => ({ ...prev, [gym.owner_id]: nextValue }));
                            }
                          }}
                          className="h-9"
                        />
                        <Button
                          variant="secondary"
                          className="h-9"
                          disabled={
                            extrasSaving[gym.owner_id] ||
                            extrasDraft[gym.owner_id] === undefined ||
                            String(extrasDraft[gym.owner_id]).replace(',', '.') === String(gym.additional_costs_amount ?? 0)
                          }
                          onClick={() => updateExtras(gym)}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleOpenPayment(gym)}>
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleOpenHistory(gym)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full text-destructive" onClick={() => handleOpenConfirm(gym)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Prov/Mun</TableHead>
                  <TableHead>Próxima facturación</TableHead>
                  <TableHead>Solicitud AI</TableHead>
                  <TableHead>Extras</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gymInfo.map((gym) => (
                  <TableRow key={gym.owner_id} className={getRowClassName(gym)}>
                    <TableCell className="font-medium">
                      <div>{gym.gym_name}</div>
                      <div className="text-xs text-muted-foreground">{dayjs(gym.created_at).format('DD/MM/YYYY')}</div>
                    </TableCell>
                    <TableCell>{gym.owner_name}</TableCell>
                    <TableCell>{gym.owner_phone || "-"}</TableCell>
                    <TableCell>
                      <div>{gym.state || "-"}</div>
                      <div className="text-xs text-muted-foreground">{gym.city || "-"}</div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const payment = roundMoney(gym.next_payment_amount ?? computeGymNextBillingAmount({
                          createdAt: gym.created_at,
                          nextPaymentDate: gym.next_payment_date,
                          isPremium: gym.store === true,
                          additionalCostsAmount: gym.additional_costs_amount ?? 0,
                        }));
                        return payment > 0 ? `${payment.toFixed(2)} USD` : '-';
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={aiRequestsDraft[gym.owner_id] ?? String(gym.ai_available_requests ?? "")}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            if (nextValue === "" || /^\d+$/.test(nextValue)) {
                              setAiRequestsDraft(prev => ({ ...prev, [gym.owner_id]: nextValue }));
                            }
                          }}
                          className="w-24 h-8 text-xs"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-3"
                          disabled={
                            aiRequestsSaving[gym.owner_id] ||
                            aiRequestsDraft[gym.owner_id] === undefined ||
                            String(aiRequestsDraft[gym.owner_id]) === String(gym.ai_available_requests ?? "") ||
                            !/^\d+$/.test(String(aiRequestsDraft[gym.owner_id]))
                          }
                          onClick={() => updateRequests(gym)}
                        >
                          Guardar
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={extrasDraft[gym.owner_id] ?? String(gym.additional_costs_amount ?? 0)}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            if (nextValue === "" || /^\d+(?:[.,]\d{0,2})?$/.test(nextValue)) {
                              setExtrasDraft(prev => ({ ...prev, [gym.owner_id]: nextValue }));
                            }
                          }}
                          className="w-24 h-8 text-xs"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-3"
                          disabled={
                            extrasSaving[gym.owner_id] ||
                            extrasDraft[gym.owner_id] === undefined ||
                            String(extrasDraft[gym.owner_id]).replace(',', '.') === String(gym.additional_costs_amount ?? 0)
                          }
                          onClick={() => updateExtras(gym)}
                        >
                          Guardar
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        value={gym.next_payment_date ? dayjs(gym.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(val) => updateNextPaymentDate(gym, val, 'gym')}
                        buttonClassName="w-36 h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch checked={gym.active || false} onCheckedChange={() => updateActiveStatus(gym, 'gym')} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{gym.store ? "PRO" : "STD"}</span>
                        <Switch checked={gym.store || false} onCheckedChange={() => updateStoreActivation(gym)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleOpenPayment(gym)}>
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Registrar Pago</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleOpenHistory(gym)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Historial de Pago</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleOpenConfirm(gym)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="icon" onClick={getAllGyms}>
              <RefreshCw className={`h-4 w-4 ${rotate ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shops">
          <div className="md:hidden space-y-4">
            {shopInfo.map((shop) => (
              <Card key={shop.owner_id} className={getRowClassName(shop)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{shop.shop_name}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {shop.owner_name} • {dayjs(shop.created_at).format('DD/MM/YYYY')}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Teléfono</span>
                      <span className="text-foreground">{shop.owner_phone || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Prov/Mun</span>
                      <span className="text-foreground">{[shop.state || "-", shop.city || "-"]?.filter(Boolean).join(" / ")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Fecha de pago</div>
                      <DatePicker
                        value={shop.next_payment_date ? dayjs(shop.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(val) => updateNextPaymentDate(shop, val, 'shop')}
                        buttonClassName="w-full h-9"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Activo</span>
                      <Switch checked={shop.active || false} onCheckedChange={() => updateActiveStatus(shop, 'shop')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleOpenPayment(shop)}>
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleOpenHistory(shop)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full text-destructive" onClick={() => handleOpenConfirm(shop)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Prov/Mun</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopInfo.map((shop) => (
                  <TableRow key={shop.owner_id} className={getRowClassName(shop)}>
                    <TableCell className="font-medium">
                      <div>{shop.shop_name}</div>
                      <div className="text-xs text-muted-foreground">{dayjs(shop.created_at).format('DD/MM/YYYY')}</div>
                    </TableCell>
                    <TableCell>{shop.owner_name}</TableCell>
                    <TableCell>{shop.owner_phone || "-"}</TableCell>
                    <TableCell>
                      <div>{shop.state || "-"}</div>
                      <div className="text-xs text-muted-foreground">{shop.city || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        value={shop.next_payment_date ? dayjs(shop.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(val) => updateNextPaymentDate(shop, val, 'shop')}
                        buttonClassName="w-36 h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch checked={shop.active || false} onCheckedChange={() => updateActiveStatus(shop, 'shop')} />
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleOpenPayment(shop)}>
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Registrar Pago</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleOpenHistory(shop)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Historial de Pago</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleOpenConfirm(shop)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="icon" onClick={getAllShops}>
              <RefreshCw className={`h-4 w-4 ${rotate ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="raffles">
          <AdminRaffle />
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary">{statistics.totalGyms}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Gimnasios</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-secondary-foreground">{statistics.totalShops}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Tiendas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-emerald-500">{statistics.totalProducts}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Productos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-amber-500">{statistics.premiumGyms}</div>
                <div className="text-sm text-muted-foreground mt-1">Cuentas Premium</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Ingresos Mensuales */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
                  <Select value={incomeCurrency} onValueChange={setIncomeCurrency}>
                    <SelectTrigger className="h-8 text-xs w-20">
                      <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map(currency => (
                        <SelectItem key={currency} value={currency} className="text-xs">
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {monthlyIncome?.gym?.some(amount => amount > 0) || monthlyIncome?.shop?.some(amount => amount > 0) || monthlyIncome?.standard?.some(amount => amount > 0) ? (
                  <ReactApexChart
                    options={{
                      chart: {
                        toolbar: { show: false },
                        background: 'transparent',
                        fontFamily: 'Montserrat, sans-serif',
                      },
                      colors: ['#6157d6', '#f278b6', '#c4941d'],
                      theme: {
                        mode: isDarkMode ? 'dark' : 'light',
                      },
                      xaxis: {
                        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                        labels: {
                          style: { colors: isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b' }
                        }
                      },
                      yaxis: {
                        labels: {
                          style: { colors: isDarkMode ? 'hsl(215 20.2% 65.1%)' : '#64748b' },
                          formatter: (value) => `${incomeCurrency} ${value.toFixed(2)}`
                        }
                      },
                      grid: {
                        borderColor: isDarkMode ? 'hsl(var(--border))' : 'rgba(0,0,0,0.05)',
                        strokeDashArray: 4,
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 1,
                          columnWidth: '70%',
                          gap: 2,
                        }
                      },
                      dataLabels: { enabled: false },
                      legend: { show: true, position: 'bottom' }
                    }}
                    series={[
                      { name: 'Premium (Gym)', data: monthlyIncome.gym },
                      { name: 'Tiendas', data: monthlyIncome.shop },
                      { name: 'Estándar (Gym)', data: monthlyIncome.standard },
                    ]}
                    type="bar"
                    height={300}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[300px] text-muted-foreground text-sm">
                    No hay datos de ingresos para {selectedYear}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col max-h-[340px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Próximos Pagos (Esta Semana)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-grow">
                {statistics.upcomingPayments?.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.upcomingPayments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center pb-2 border-b last:border-0">
                        <div>
                          <div className="font-semibold text-sm">{payment.name}</div>
                          <div className="text-xs text-muted-foreground">{payment.type}</div>
                        </div>
                        <div className={`text-sm font-bold ${dayjs(payment.date).isBefore(dayjs(), 'day') ? 'text-destructive' : 'text-primary'}`}>
                          {dayjs(payment.date).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">No hay pagos programados para esta semana</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gimnasios por Provincia</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.gymsByProvince).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.gymsByProvince))}
                    series={[{ name: 'Gimnasios', data: Object.values(statistics.gymsByProvince) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[250px] text-muted-foreground text-sm">No hay datos</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Miembros por Gimnasio</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.membersByGymName || {}).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.membersByGymName).map(name => name.length > 15 ? name.substring(0, 15) + '...' : name))}
                    series={[{ name: 'Miembros', data: Object.values(statistics.membersByGymName) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[250px] text-muted-foreground text-sm">No hay datos</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiendas por Provincia</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.shopsByProvince || {}).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.shopsByProvince))}
                    series={[{ name: 'Tiendas', data: Object.values(statistics.shopsByProvince) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[250px] text-muted-foreground text-sm">No hay datos</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos por Tienda</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.totalProductsByShop).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.totalProductsByShop))}
                    series={[{ name: 'Productos', data: Object.values(statistics.totalProductsByShop) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[250px] text-muted-foreground text-sm">No hay datos</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipos de Cuentas</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={getChartOptions(['Premium', 'Estándar', 'Tiendas'], true, ['#10b981', '#f43f5e', '#3399cc'])}
                  series={[statistics.premiumGyms, statistics.standardGyms, statistics.shops]}
                  type="donut"
                  height={250}
                />
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="font-medium">{selectedGym?.gym_name || selectedGym?.shop_name}</div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto pagado</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              {selectedType === 'gym' && expectedPaymentAmount !== null && expectedPaymentAmount !== undefined && (
                <div className="text-xs text-muted-foreground">
                  Monto esperado: {Number(expectedPaymentAmount).toFixed(2)} USD
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Moneda</Label>
              <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUP">CUP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Próxima fecha de pago</Label>
              <DatePicker value={paymentNextDate} onChange={setPaymentNextDate} />
            </div>
            {selectedType === 'gym' && (
              <div className="text-sm">
                <span className="text-muted-foreground">Plan:</span> {paymentPlan}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPayment(false)}>Cancelar</Button>
            <Button onClick={handleSavePayment} disabled={savingPayment || !paymentAmount || !paymentCurrency}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Historial de Pago</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-4">
            {historyRows.length === 0 ? (
              <div className="text-center text-muted-foreground">Sin registros</div>
            ) : (
              historyRows.map((h) => (
                <Card key={h.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{dayjs(h.created_at).format('DD/MM/YYYY')}</span>
                    <Badge variant="secondary">{h.quantity_paid} {h.currency}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Próximo: {h.next_payment_date ? dayjs(h.next_payment_date).format('DD/MM/YYYY') : '-'}</span>
                    <span>Plan: {h.active_plan || 'N/A'}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenHistory(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        contentText={`¿Estás seguro de que quieres eliminar la cuenta de ${itemToDelete?.gym_name || itemToDelete?.shop_name}? Esta acción es irreversible.`}
      />
    </div>
  );
};

export default AdminPanel;
