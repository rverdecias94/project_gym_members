/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { styled, useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import {
  Button, Grid, TextField, Typography, useMediaQuery,
  Card, CardContent, CardActions, Box, Tabs, Tab,
  Tooltip,
  IconButton
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
    backgroundColor: '#1da274ff',
    width: 32,
    height: 32,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#46a27266',
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    getAllGyms();
    getAllShops();
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
      dataType === 'gym' ? getAllGyms() : getAllShops();
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
      dataType === 'gym' ? getAllGyms() : getAllShops();
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm(""); // Limpiar búsqueda al cambiar de pestaña
    setGymInfo(gymInfoOriginal);
    setShopInfo(shopInfoOriginal);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === '') {
      setGymInfo(gymInfoOriginal);
      setShopInfo(shopInfoOriginal);
      return;
    }

    if (tabValue === 0) { // Filtrar Gimnasios
      const filteredData = gymInfoOriginal.filter(item =>
        item.gym_name?.toLowerCase().includes(value) ||
        item.address?.toLowerCase().includes(value) ||
        item.owner_name?.toLowerCase().includes(value) ||
        item.city?.toLowerCase().includes(value)
      );
      setGymInfo(filteredData);
    } else { // Filtrar Tiendas
      const filteredData = shopInfoOriginal.filter(item =>
        item.shop_name?.toLowerCase().includes(value) ||
        item.address?.toLowerCase().includes(value) ||
        item.owner_name?.toLowerCase().includes(value) ||
        item.city?.toLowerCase().includes(value)
      );
      setShopInfo(filteredData);
    }
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
      field: 'actions', headerName: 'Activar', sortable: false, width: 100,
      renderCell: ({ row }) => (<CustomSwitch onChange={() => updateActiveStatus(row, 'gym')} checked={row.active} />),
    },
    {
      field: 'store', headerName: 'Plan Activo', sortable: false, width: 130,
      renderCell: ({ row }) => {
        return (
          <div>
            {/* <CustomSwitch onChange={() => updateStoreActivation(row)} checked={row.store} /> */}
            {row.store ? "Premium" : "Estándar"}
          </div>
        )
      }
    },
    {
      field: 'payments', headerName: 'Registrar Pago', width: 150,
      renderCell: ({ row }) => {
        return (
          <div>
            <Tooltip title="Registrar Pago" placement='top'>
              <IconButton
                sx={{ color: "green" }}
                onClick={() => alert(row?.owner_id)}
                size="small"
              >
                <PaymentIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Historial de Pago" placement='top'>
              <IconButton
                sx={{ color: "green" }}
                onClick={() => alert(row?.owner_name)}
                size="small"
              >
                <RequestQuoteIcon />
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
      field: 'active', headerName: 'Activar', sortable: false, width: 100,
      renderCell: ({ row }) => (<CustomSwitch onChange={() => updateActiveStatus(row, 'shop')} checked={row.active} />),
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
            <TextField fullWidth label={`Buscar en ${tabValue === 0 ? 'Gimnasios' : 'Tiendas'}`} value={search} onChange={handleSearch} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              onClick={fetchAllData}
              sx={{ transition: 'transform 1s ease', transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)' }}
            >
              <AutorenewIcon />
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Gimnasios" id="tab-0" />
            <Tab label="Tiendas" id="tab-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {!isMobile ? (
            <DataGrid autoHeight rows={gymInfo} columns={gymColumns} pageSizeOptions={[5, 10, 20]} getRowId={(row) => row.owner_id} getRowClassName={getRowClassName} />
          ) : (
            <Grid container spacing={2}>
              {gymInfo.map((gym) => (
                <Grid item xs={12} key={gym.owner_id}>
                  <Card className={getRowClassName({ row: gym })}>
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
                        <Typography variant="body2">Activo:</Typography>
                        <CustomSwitch onChange={() => updateActiveStatus(gym, 'gym')} checked={gym.active} />
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
            <DataGrid autoHeight rows={shopInfo} columns={shopColumns} pageSizeOptions={[5, 10, 20]} getRowId={(row) => row.owner_id} getRowClassName={getRowClassName} />
          ) : (
            <Grid container spacing={2}>
              {shopInfo.map((shop) => (
                <Grid item xs={12} key={shop.owner_id}>
                  <Card className={getRowClassName({ row: shop })}>
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
                      <Typography variant="body2" ml={1.5}>Activo:</Typography>
                      <CustomSwitch onChange={() => updateActiveStatus(shop, 'shop')} checked={shop.active} />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Box>
    </>
  );
};

export default AdminPanel;