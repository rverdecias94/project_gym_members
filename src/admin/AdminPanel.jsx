/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { styled, useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import {
  Button, Grid, TextField, Typography, useMediaQuery,
  Card, CardContent, CardActions, Box, Tabs, Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { supabase } from '../supabase/client';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { useSnackbar } from "../context/Snackbar";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminRaffle from "./AdminRaffle";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ReactApexChart from 'react-apexcharts';

const CustomSwitch = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#d8d1f1d0',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#bdbdbd',
    width: 32,
    height: 32,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 20 / 2,
  },
  '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
    backgroundColor: '#6353bd',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel = () => {
  const [gymInfo, setGymInfo] = useState([]);
  const [gymInfoOriginal, setGymInfoOriginal] = useState([]);
  const [shopInfo, setShopInfo] = useState([]);
  const [shopInfoOriginal, setShopInfoOriginal] = useState([]);

  const [search, setSearchTerm] = useState("");
  const [rotate, setRotate] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showMessage } = useSnackbar();
  const [openPayment, setOpenPayment] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedType, setSelectedType] = useState('gym');
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentNextDate, setPaymentNextDate] = useState(null);
  const [paymentPlan, setPaymentPlan] = useState("Estándar");
  const [savingPayment, setSavingPayment] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados para estadísticas
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

  const getStatistics = async () => {
    try {
      // Obtener datos de gimnasios
      const { data: gymsData } = await supabase.from('info_general_gym').select('*');

      // Obtener datos de tiendas
      const { data: shopsData } = await supabase.from('info_shops').select('*');

      // Obtener productos por tienda
      const { data: productsData } = await supabase.from('products').select('user_store_id');

      // Obtener miembros por gimnasio
      const { data: membersData } = await supabase.from('members').select('gym_id');

      // Mapa de IDs a Nombres
      const storeNamesMap = {};
      gymsData?.forEach(gym => {
        if (gym.owner_id) storeNamesMap[gym.owner_id] = gym.gym_name || 'Gimnasio Desconocido';
      });
      shopsData?.forEach(shop => {
        if (shop.owner_id) storeNamesMap[shop.owner_id] = shop.shop_name || 'Tienda Desconocida';
      });

      // Estadísticas de gimnasios y tiendas por provincia
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

      // Estadísticas de clientes por gimnasio
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

      // Próximas cuentas a pagar (semana actual)
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

      // Cuentas premium vs estándar
      let premiumGyms = 0;
      let standardGyms = 0;
      gymsData?.forEach(gym => {
        if (gym.store) {
          premiumGyms++;
        } else {
          standardGyms++;
        }
      });

      // Productos por tienda usando nombres en lugar de UUIDs
      const productsByShop = {};
      productsData?.forEach(product => {
        const shopId = product.user_store_id;
        if (shopId) {
          const storeName = storeNamesMap[shopId] || 'Tienda Desconocida';
          productsByShop[storeName] = (productsByShop[storeName] || 0) + 1;
        }
      });

      // Tienda con más productos
      let shopWithMostProducts = null;
      let maxProducts = 0;
      Object.entries(productsByShop).forEach(([storeName, count]) => {
        if (count > maxProducts) {
          maxProducts = count;
          shopWithMostProducts = storeName;
        }
      });

      // Actualizar estadísticas
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
      if (dataType === 'gym') getAllGyms(); else getAllShops();
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
      getAllGyms();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPayment = (row) => {
    setSelectedGym(row);
    setSelectedType(tabValue === 0 ? 'gym' : 'shop');
    setPaymentAmount("");
    setPaymentCurrency("USD");
    setPaymentNextDate(row?.next_payment_date ? dayjs(row.next_payment_date) : null);
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
    const type = tabValue === 0 ? 'gym' : 'shop';
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm("");
    setGymInfo(gymInfoOriginal);
    setShopInfo(shopInfoOriginal);
    // Cargar estadísticas cuando se selecciona la pestaña de estadísticas
    if (newValue === 3) {
      getStatistics();
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === '') {
      if (tabValue === 0) setGymInfo(gymInfoOriginal);
      else setShopInfo(shopInfoOriginal);
      return;
    }

    const source = tabValue === 0 ? gymInfoOriginal : shopInfoOriginal;
    const filteredData = source.filter(item =>
      (item.gym_name || item.shop_name)?.toLowerCase().includes(value) ||
      item.address?.toLowerCase().includes(value) ||
      item.owner_name?.toLowerCase().includes(value) ||
      item.city?.toLowerCase().includes(value)
    );
    if (tabValue === 0) setGymInfo(filteredData);
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

  const getRowClassName = (params) => {
    if (isNewRow(params.row)) {
      return 'new-row';
    }
    if (isOverdue(params.row)) {
      return 'overdue-row';
    }
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

  const gymColumns = [
    { field: 'gym_name', headerName: 'Nombre Gym', width: 130 },
    { field: 'address', headerName: 'Dirección', width: 130 },
    { field: 'owner_name', headerName: 'Propietario', width: 200 },
    { field: 'owner_phone', headerName: 'Teléfono', width: 110, renderCell: (params) => params.value || "-" },
    { field: 'created_at', headerName: 'Fecha Creación', width: 120, renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY') },
    {
      field: 'next_payment_date', headerName: 'Fecha de Pago', width: 180,
      renderCell: ({ row }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            defaultValue={row.next_payment_date ? dayjs(row.next_payment_date) : null}
            onChange={(newDate) => updateNextPaymentDate(row, newDate, 'gym')}
          />
        </LocalizationProvider>
      ),
    },
    { field: 'state', headerName: 'Provincia', width: 110, renderCell: (params) => params.value || "-" },
    { field: 'city', headerName: 'Municipio', width: 110, renderCell: (params) => params.value || "-" },
    { field: 'clients', headerName: 'Clientes', width: 80, renderCell: (params) => params.value > 0 ? params.value : "-" },
    {
      field: 'monthly_payment', headerName: 'Pago Mensual', width: 100,
      renderCell: ({ row }) => {
        const payment = row.store ? calculateDebt(row.created_at, row.next_payment_date, 28) : calculateDebt(row.created_at, row.next_payment_date, 15);
        return <Typography>{payment > 0 ? `${payment.toFixed(2)} USD` : '-'}</Typography>;
      },
    },
    {
      field: 'actions', headerName: 'Estado', sortable: false, width: 100,
      renderCell: ({ row }) => (
        <Tooltip title={row.active ? "Activo" : "Inactivo"} placement="top">
          <span>
            <CustomSwitch onChange={() => updateActiveStatus(row, 'gym')} checked={row.active} />
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'store', headerName: 'Plan Activo', sortable: false, width: 130,
      renderCell: ({ row }) => {
        return (
          <div>
            {row.store ? "Premium" : "Estándar"}
          </div>
        )
      }
    },
    {
      field: 'payments', headerName: 'Acciones', width: 180,
      renderCell: ({ row }) => {
        return (
          <div>
            <Tooltip title='Registrar Pago' placement='top'>
              <IconButton sx={{ color: "green" }} onClick={() => handleOpenPayment(row)} size="small">
                <PaymentIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Historial de Pago' placement='top'>
              <IconButton sx={{ color: "green" }} onClick={() => handleOpenHistory(row)} size="small">
                <RequestQuoteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar' placement='top'>
              <IconButton sx={{ color: "red" }} onClick={() => handleOpenConfirm(row)} size="small">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        )
      },
    }
  ];

  const shopColumns = [
    { field: 'shop_name', headerName: 'Nombre Tienda', width: 150 },
    { field: 'address', headerName: 'Dirección', width: 150 },
    { field: 'owner_name', headerName: 'Propietario', width: 200 },
    { field: 'owner_phone', headerName: 'Teléfono', width: 120, renderCell: (params) => params.value || "-" },
    { field: 'created_at', headerName: 'Fecha Creación', width: 120, renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY') },
    {
      field: 'next_payment_date', headerName: 'Fecha de Pago', width: 180,
      renderCell: ({ row }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            defaultValue={row.next_payment_date ? dayjs(row.next_payment_date) : null}
            onChange={(newDate) => updateNextPaymentDate(row, newDate, 'shop')}
          />
        </LocalizationProvider>
      ),
    },
    { field: 'state', headerName: 'Provincia', width: 120, renderCell: (params) => params.value || "-" },
    { field: 'city', headerName: 'Municipio', width: 120, renderCell: (params) => params.value || "-" },
    {
      field: 'active', headerName: 'Estado', sortable: false, width: 100,
      renderCell: ({ row }) => (
        <Tooltip title={row.active ? "Activo" : "Inactivo"} placement="top">
          <span>
            <CustomSwitch onChange={() => updateActiveStatus(row, 'shop')} checked={row.active} />
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'payments', headerName: 'Acciones', width: 180,
      renderCell: ({ row }) => (
        <div>
          <Tooltip title='Registrar Pago' placement='top'>
            <IconButton sx={{ color: "green" }} onClick={() => handleOpenPayment(row)} size="small">
              <PaymentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Historial de Pago' placement='top'>
            <IconButton sx={{ color: "green" }} onClick={() => handleOpenHistory(row)} size="small">
              <RequestQuoteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Eliminar' placement='top'>
            <IconButton sx={{ color: "red" }} onClick={() => handleOpenConfirm(row)} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          .new-row {
            background-color: rgba(188, 238, 219, 1) !important;
          }
          .overdue-row {
            background-color: #ffcccb !important;
          }
        `}
      </style>
      <Box p={2}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Panel de Administración
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            {
              tabValue !== 2 && tabValue !== 3 &&
              <TextField
                fullWidth
                label={`Buscar en ${tabValue === 0 ? 'Gimnasios' : 'Tiendas'}`}
                value={search}
                onChange={handleSearch}
                size="small"
                InputLabelProps={{
                  style: { color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' },
                }}
                InputProps={{
                  style: { color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' },
                }}
              />
            }
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'var(--border)', mt: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                borderBottom: '2px solid transparent',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                minHeight: 44,
                px: 2,
                textTransform: 'uppercase',
                '&.Mui-selected': { color: 'hsl(var(--foreground))', borderBottomColor: 'hsl(var(--primary))' },
              }
            }}
          >
            <Tab label="Gimnasios" id="tab-0" />
            <Tab label="Tiendas" id="tab-1" />
            <Tab label="Sorteos" id="tab-2" />
            <Tab label="Estadísticas" id="tab-3" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {!isMobile ? (
            <>
              <DataGrid autoHeight rows={gymInfo} columns={gymColumns} pageSizeOptions={[5, 10, 20]} getRowId={(row) => row.owner_id} getRowClassName={getRowClassName} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title="Recargar">
                  <IconButton onClick={getAllGyms} sx={{ transition: 'transform 1s ease', transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)' }}>
                    <AutorenewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Grid container spacing={2}>
              {gymInfo.map((gym) => (
                <Grid item xs={12} key={gym.owner_id}>
                  <Card className={getRowClassName({ row: gym })} sx={{ boxShadow: 'none', border: '1px solid #eaeaea', borderRadius: '12px' }}>
                    <CardContent>
                      <Typography variant="h6">{gym.gym_name}</Typography>
                      <Typography variant="body2">Dirección: {gym.address}</Typography>
                      <Typography variant="body2">Propietario: {gym.owner_name}</Typography>
                      <Typography variant="body2">Teléfono: {gym.owner_phone || '-'}</Typography>
                      <Typography variant="body2">Fecha Creación: {dayjs(gym.created_at).format('DD/MM/YYYY')}</Typography>
                      <Typography variant="body2">Provincia: {gym.state || '-'}</Typography>
                      <Typography variant="body2">Municipio: {gym.city || '-'}</Typography>
                      <Typography variant="body2">Clientes: {gym.clients > 0 ? gym.clients : '-'}</Typography>
                      <Box mt={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <MobileDatePicker
                            label="Fecha de Pago"
                            defaultValue={gym.next_payment_date ? dayjs(gym.next_payment_date) : null}
                            onChange={(newDate) => updateNextPaymentDate(gym, newDate, 'gym')}
                          />
                        </LocalizationProvider>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">Estado:</Typography>
                        <Tooltip title={gym.active ? "Activo" : "Inactivo"} placement="top">
                          <span>
                            <CustomSwitch onChange={() => updateActiveStatus(gym, 'gym')} checked={gym.active} />
                          </span>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">Tienda:</Typography>
                        <CustomSwitch onChange={() => updateStoreActivation(gym)} checked={gym.store} />
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {!isMobile ? (
            <>
              <DataGrid autoHeight rows={shopInfo} columns={shopColumns} pageSizeOptions={[5, 10, 20]} getRowId={(row) => row.owner_id} getRowClassName={getRowClassName} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title="Recargar">
                  <IconButton onClick={getAllShops} sx={{ transition: 'transform 1s ease', transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)' }}>
                    <AutorenewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Grid container spacing={2}>
              {shopInfo.map((shop) => (
                <Grid item xs={12} key={shop.owner_id}>
                  <Card className={getRowClassName({ row: shop })} sx={{ boxShadow: 'none', border: '1px solid #eaeaea', borderRadius: '12px' }}>
                    <CardContent>
                      <Typography variant="h6">{shop.shop_name}</Typography>
                      <Typography variant="body2">Dirección: {shop.address}</Typography>
                      <Typography variant="body2">Propietario: {shop.owner_name}</Typography>
                      <Typography variant="body2">Teléfono: {shop.owner_phone || '-'}</Typography>
                      <Typography variant="body2">Fecha Creación: {dayjs(shop.created_at).format('DD/MM/YYYY')}</Typography>
                      <Typography variant="body2">Provincia: {shop.state || '-'}</Typography>
                      <Typography variant="body2">Municipio: {shop.city || '-'}</Typography>
                      <Box mt={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <MobileDatePicker
                            label="Fecha de Pago"
                            defaultValue={shop.next_payment_date ? dayjs(shop.next_payment_date) : null}
                            onChange={(newDate) => updateNextPaymentDate(shop, newDate, 'shop')}
                          />
                        </LocalizationProvider>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Typography variant="body2" ml={1.5}>Estado:</Typography>
                      <Tooltip title={shop.active ? "Activo" : "Inactivo"} placement="top">
                        <span>
                          <CustomSwitch onChange={() => updateActiveStatus(shop, 'shop')} checked={shop.active} />
                        </span>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <AdminRaffle />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Resumen General */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Resumen General</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <Typography variant="h4" color="primary">{statistics.totalGyms}</Typography>
                    <Typography variant="body2">Total Gimnasios</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <Typography variant="h4" color="secondary">{statistics.totalShops}</Typography>
                    <Typography variant="body2">Total Tiendas</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <Typography variant="h4" color="success">{statistics.totalProducts}</Typography>
                    <Typography variant="body2">Total Productos</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <Typography variant="h4" color="warning">{statistics.premiumGyms}</Typography>
                    <Typography variant="body2">Cuentas Premium</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Gimnasios por Provincia */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Gimnasios por Provincia</Typography>
                {Object.keys(statistics.gymsByProvince).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.gymsByProvince))}
                    series={[{ name: 'Gimnasios', data: Object.values(statistics.gymsByProvince) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Miembros por Gimnasio */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Miembros por Gimnasio</Typography>
                {Object.keys(statistics.membersByGymName || {}).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.membersByGymName).map(name => name.length > 15 ? name.substring(0, 15) + '...' : name))}
                    series={[{ name: 'Miembros', data: Object.values(statistics.membersByGymName) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Cuentas Premium vs Estándar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Tipos de Cuentas</Typography>
                <ReactApexChart
                  options={getChartOptions(['Premium', 'Estándar'], true, ['#1da274', '#f278b6'])}
                  series={[statistics.premiumGyms, statistics.standardGyms]}
                  type="donut"
                  height={250}
                />
              </Card>
            </Grid>

            {/* Tiendas por Provincia */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Tiendas por Provincia</Typography>
                {Object.keys(statistics.shopsByProvince || {}).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.shopsByProvince))}
                    series={[{ name: 'Tiendas', data: Object.values(statistics.shopsByProvince) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Productos por Tienda */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Productos por Tienda</Typography>
                {Object.keys(statistics.totalProductsByShop).length > 0 ? (
                  <ReactApexChart
                    options={getChartOptions(Object.keys(statistics.totalProductsByShop))}
                    series={[{ name: 'Productos', data: Object.values(statistics.totalProductsByShop) }]}
                    type="bar"
                    height={250}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                    <Typography variant="body2" color="text.secondary">No hay tiendas con productos</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Próximas Cuentas a Pagar y Estadísticas Adicionales */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '350px', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px', overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>Próximos Pagos (Esta Semana)</Typography>
                {statistics.upcomingPayments?.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {statistics.upcomingPayments.map((payment, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: index < statistics.upcomingPayments.length - 1 ? '1px solid #eaeaea' : 'none' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{payment.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{payment.type}</Typography>
                        </Box>
                        <Typography variant="body1" color={dayjs(payment.date).isBefore(dayjs(), 'day') ? 'error' : 'primary'} fontWeight="bold">
                          {dayjs(payment.date).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No hay pagos programados para esta semana</Typography>
                )}
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Información Adicional</Typography>
                <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', boxShadow: 'none' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Tienda con más productos</Typography>
                      <Typography variant="h6" color="primary">{statistics.shopWithMostProducts ? statistics.shopWithMostProducts : 'Ninguna'}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', boxShadow: 'none' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Máximo de productos</Typography>
                      <Typography variant="h6" color="secondary">{Math.max(...Object.values(statistics.totalProductsByShop), 0)}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', boxShadow: 'none' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Promedio prod/tienda</Typography>
                      <Typography variant="h6" color="success.main">{statistics.totalShops > 0 ? Math.round(statistics.totalProducts / statistics.totalShops) : 0}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', boxShadow: 'none' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>% Cuentas Premium</Typography>
                      <Typography variant="h6" color="warning.main">{statistics.totalGyms > 0 ? Math.round((statistics.premiumGyms / statistics.totalGyms) * 100) : 0}%</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      <Dialog open={openPayment} onClose={() => setOpenPayment(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { boxShadow: 'none', border: '1px solid #eaeaea', borderRadius: '12px' } }}>
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 1 }}>
            <Typography variant="body2">{selectedGym?.gym_name || selectedGym?.shop_name}</Typography>
            <TextField label="Cantidad a pagar" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select value={paymentCurrency} label="Moneda" onChange={(e) => setPaymentCurrency(e.target.value)}>
                <MenuItem value="CUP">CUP</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDatePicker
                label="Próxima fecha de pago"
                value={paymentNextDate}
                onChange={(newDate) => setPaymentNextDate(newDate)}
              />
            </LocalizationProvider>
            {selectedType === 'gym' && (
              <FormControl fullWidth>
                <InputLabel>Tipo de plan</InputLabel>
                <Select value={paymentPlan} label="Tipo de plan" onChange={(e) => setPaymentPlan(e.target.value)}>
                  <MenuItem value="Estándar">Estándar</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayment(false)}>Cerrar</Button>
          <Button onClick={handleSavePayment} variant="contained" disabled={savingPayment || !paymentAmount || !paymentCurrency}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { boxShadow: 'none', border: '1px solid #eaeaea', borderRadius: '12px' } }}>
        <DialogTitle>Historial de Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
            {historyRows.length === 0 ? (
              <Typography variant="body2">Sin registros</Typography>
            ) : (
              historyRows.map((h) => (
                <Card key={h.id} sx={{ mb: 1, boxShadow: 'none', border: '1px solid #eaeaea', borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="body2">{dayjs(h.created_at).format('DD/MM/YYYY')}</Typography>
                    <Typography variant="body2">{h.quantity_paid} {h.currency}</Typography>
                    <Typography variant="body2">Próximo pago: {h.next_payment_date ? dayjs(h.next_payment_date).format('DD/MM/YYYY') : '-'}</Typography>
                    <Typography variant="body2">Plan: {h.active_plan}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        contentText={`¿Estás seguro de que quieres eliminar la cuenta de ${itemToDelete?.gym_name || itemToDelete?.shop_name}? Esta acción es irreversible.`}
      />
    </>
  );
};

export default AdminPanel;
