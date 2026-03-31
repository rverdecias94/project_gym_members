import { useState, useEffect } from "react";
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { useSnackbar } from "../context/Snackbar";
import AdminRaffle from "./AdminRaffle";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ReactApexChart from 'react-apexcharts';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { RefreshCw, Search, Trash2, FileText, CreditCard } from "lucide-react";

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
  const [paymentPlan, setPaymentPlan] = useState("Estándar");
  const [savingPayment, setSavingPayment] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [statistics, setStatistics] = useState({
    gymsByProvince: {},
    shopsByProvince: {},
    clientsByGym: {},
    membersByGymName: {},
    upcomingPayments: [],
    premiumGyms: 0,
    standardGyms: 0,
    shopsWithProducts: {},
    totalProductsByShop: {},
    shopWithMostProducts: null,
    totalGyms: 0,
    totalShops: 0,
    totalProducts: 0
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

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
  }, []);

  const fetchAllData = () => {
    getAllGyms();
    getAllShops();
    getStatistics();
  };

  const getAllGyms = async () => {
    setRotate(true);
    try {
      const { data, error } = await supabase.from('info_general_gym').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGymInfo(data || []);
      setGymInfoOriginal(data || []);
      showMessage("Listado de gimnasios actualizado", "success");
    } catch (err) {
      console.error("Error fetching gyms:", err);
      showMessage("Error cargando listado de gimnasios", "error");
    } finally {
      setTimeout(() => setRotate(false), 1000);
    }
  };

  const getAllShops = async () => {
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
  };

  const getStatistics = async () => {
    try {
      const { data: gymsData } = await supabase.from('info_general_gym').select('*');
      const { data: shopsData } = await supabase.from('info_shops').select('*');
      const { data: productsData } = await supabase.from('products').select('user_store_id');
      const { data: membersData } = await supabase.from('members').select('gym_id');

      const storeNamesMap = {};
      gymsData?.forEach(gym => {
        if (gym.owner_id) storeNamesMap[gym.owner_id] = gym.gym_name || 'Gimnasio Desconocido';
      });
      shopsData?.forEach(shop => {
        if (shop.owner_id) storeNamesMap[shop.owner_id] = shop.shop_name || 'Tienda Desconocida';
      });

      const gymsByProvince = {};
      gymsData?.forEach(gym => {
        const province = gym.state || 'Sin provincia';
        gymsByProvince[province] = (gymsByProvince[province] || 0) + 1;
      });

      const shopsByProvince = {};
      shopsData?.forEach(shop => {
        const province = shop.state || 'Sin provincia';
        shopsByProvince[province] = (shopsByProvince[province] || 0) + 1;
      });

      const clientsByGym = {};
      membersData?.forEach(member => {
        if (member.gym_id) {
          clientsByGym[member.gym_id] = (clientsByGym[member.gym_id] || 0) + 1;
        }
      });

      const membersByGymName = {};
      Object.entries(clientsByGym).forEach(([gymId, count]) => {
        const gymName = storeNamesMap[gymId] || 'Gimnasio Desconocido';
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

      setStatistics({
        gymsByProvince,
        shopsByProvince,
        clientsByGym,
        membersByGymName,
        upcomingPayments,
        premiumGyms,
        standardGyms,
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
  };

  const updateNextPaymentDate = async (row, newDate, dataType) => {
    const tableName = dataType === 'gym' ? 'info_general_gym' : 'info_shops';
    const updatedRow = {
      ...row,
      next_payment_date: newDate ? dayjs(newDate).format("YYYY-MM-DD") : null,
    };

    try {
      if (!row.owner_id) return;
      const { error } = await supabase.from(tableName).update(updatedRow).eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Fecha de pago actualizada con éxito!", "success");
      if (dataType === 'gym') getAllGyms(); else getAllShops();
    } catch (error) {
      showMessage("Error al actualizar la fecha de pago.", "error");
    }
  };

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
    try {
      if (!row.owner_id) return;
      const { error } = await supabase.from("info_general_gym").update(updatedRow).eq("owner_id", row.owner_id);
      if (error) throw error;
      showMessage("¡Estado de la tienda actualizado!", "success");
      setGymInfo(prev => prev.map(g => g.owner_id === row.owner_id ? updatedRow : g));
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPayment = (row) => {
    setSelectedGym(row);
    setSelectedType(tabValue === 'gyms' ? 'gym' : 'shop');
    setPaymentAmount("");
    setPaymentCurrency("USD");
    setPaymentNextDate(row?.next_payment_date ? dayjs(row.next_payment_date).format('YYYY-MM-DD') : "");
    setPaymentPlan(row?.store ? "Premium" : "Estándar");
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
        const desiredStore = paymentPlan === "Premium";
        if (!!selectedGym.store !== desiredStore) {
          await updateStoreActivation(selectedGym);
        }
      }
      await updateNextPaymentDate(selectedGym, paymentNextDate, selectedType);
      const payload = {
        uid_customer: selectedGym.owner_id,
        quantity_paid: parseFloat(paymentAmount),
        currency: paymentCurrency,
        next_payment_date: paymentNextDate ? dayjs(paymentNextDate).format("YYYY-MM-DD") : null,
        active_plan: selectedType === 'gym' ? paymentPlan : null,
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

  function calculateDebt(created_at, next_payment_date, paymentAmount) {
    const created = new Date(created_at);
    const now = new Date(next_payment_date);

    let fullMonths =
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth());

    if (now.getDate() < created.getDate()) {
      fullMonths -= 1;
    }

    if (fullMonths <= 0) {
      return 0;
    } else if (fullMonths === 1 || fullMonths === 2) {
      return paymentAmount * 0.7;
    } else {
      return paymentAmount;
    }
  }

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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Prov/Mun</TableHead>
                  <TableHead>Pago Mensual</TableHead>
                  <TableHead>Fecha Pago</TableHead>
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
                        const payment = gym.store ? calculateDebt(gym.created_at, gym.next_payment_date, 28) : calculateDebt(gym.created_at, gym.next_payment_date, 15);
                        return payment > 0 ? `${payment.toFixed(2)} USD` : '-';
                      })()}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="date" 
                        value={gym.next_payment_date ? dayjs(gym.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(e) => updateNextPaymentDate(gym, e.target.value, 'gym')}
                        className="w-36 h-8 text-xs"
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
          <div className="rounded-md border overflow-x-auto">
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
                      <Input 
                        type="date" 
                        value={shop.next_payment_date ? dayjs(shop.next_payment_date).format('YYYY-MM-DD') : ''}
                        onChange={(e) => updateNextPaymentDate(shop, e.target.value, 'shop')}
                        className="w-36 h-8 text-xs"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                <CardTitle className="text-lg">Tipos de Cuentas</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={getChartOptions(['Premium', 'Estándar'], true, ['#10b981', '#f43f5e'])}
                  series={[statistics.premiumGyms, statistics.standardGyms]}
                  type="donut"
                  height={250}
                />
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
              <Label htmlFor="amount">Cantidad a pagar</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
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
              <Input
                type="date"
                value={paymentNextDate}
                onChange={(e) => setPaymentNextDate(e.target.value)}
              />
            </div>
            {selectedType === 'gym' && (
              <div className="grid gap-2">
                <Label>Tipo de plan</Label>
                <Select value={paymentPlan} onValueChange={setPaymentPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estándar">Estándar</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
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