import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from "../context/Snackbar";
import SorteoFitness from "./Sorteo";
import { useTheme } from '@mui/material/styles';
import ConfirmationDialog from "../components/ConfirmationDialog";

const AdminRaffle = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const [rotate, setRotate] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [raffleToDelete, setRaffleToDelete] = useState(null);

  // Run Raffle State
  const [runningRaffle, setRunningRaffle] = useState(null);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [currentRaffle, setCurrentRaffle] = useState(null);
  const [formData, setFormData] = useState({
    name_lottery: "",
    prize_lottery: "",
    requirement_lottery: "",
    url_instagram: "",
    start_date: null,
    expiration_date: null,
    state_lottery: "0" // 0: Activo, 1: Cerrado, 2: Finalizado
  });

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRaffleId, setMenuRaffleId] = useState(null);

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    setLoading(true);
    setRotate(true);
    try {
      const { data, error } = await supabase
        .from('raffles_tronoss')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching raffles:", error);
        showMessage("Error cargando sorteos", "error");
      } else {
        setRaffles(data || []);
        showMessage("Listado de sorteos actualizado", "success");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error cargando sorteos", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setRotate(false), 1000);
    }
  };

  const handleOpenModal = (raffle = null) => {
    if (raffle) {
      setCurrentRaffle(raffle);
      setFormData({
        name_lottery: raffle.name_lottery,
        prize_lottery: raffle.prize_lottery,
        requirement_lottery: raffle.requirement_lottery,
        url_instagram: raffle.url_instagram || "",
        start_date: raffle.start_date ? dayjs(raffle.start_date) : null,
        expiration_date: raffle.expiration_date ? dayjs(raffle.expiration_date) : null,
        state_lottery: String(raffle.state_lottery)
      });
    } else {
      setCurrentRaffle(null);
      setFormData({
        name_lottery: "",
        prize_lottery: "",
        requirement_lottery: "",
        url_instagram: "",
        start_date: dayjs(),
        expiration_date: dayjs().add(1, 'month'),
        state_lottery: "0"
      });
    }
    setOpenModal(true);
    handleCloseMenu();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentRaffle(null);
  };

  const handleSave = async () => {
    if (!formData.name_lottery || !formData.start_date || !formData.expiration_date) {
      showMessage("Por favor complete los campos obligatorios", "error");
      return;
    }

    const payload = {
      name_lottery: formData.name_lottery,
      prize_lottery: formData.prize_lottery,
      requirement_lottery: formData.requirement_lottery,
      url_instagram: formData.url_instagram,
      start_date: formData.start_date.format('YYYY-MM-DD'),
      expiration_date: formData.expiration_date.format('YYYY-MM-DD'),
      state_lottery: formData.state_lottery
    };

    try {
      if (currentRaffle) {
        const { error } = await supabase
          .from('raffles_tronoss')
          .update(payload)
          .eq('id', currentRaffle.id);

        if (error) throw error;
        showMessage("Sorteo actualizado", "success");
        fetchRaffles();
      } else {
        const { error } = await supabase
          .from('raffles_tronoss')
          .insert([{ ...payload, quantity_participants: 0 }])
          .select();

        if (error) throw error;
        showMessage("Sorteo creado", "success");
        fetchRaffles();
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      showMessage("Error guardando sorteo", "error");
    }
  };

  const handleOpenConfirm = () => {
    const raffleData = raffles.find(r => r.id === menuRaffleId);
    setRaffleToDelete(raffleData);
    setOpenConfirm(true);
    handleCloseMenu();
  };

  const handleCloseConfirm = () => {
    setRaffleToDelete(null);
    setOpenConfirm(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (!raffleToDelete) return;
    try {
      const { error } = await supabase
        .from('raffles_tronoss')
        .delete()
        .eq('id', raffleToDelete.id);

      if (error) throw error;

      setRaffles(prev => prev.filter(r => r.id !== raffleToDelete.id));
      showMessage("Sorteo eliminado", "success");
    } catch (err) {
      console.error(err);
      showMessage("Error eliminando sorteo", "error");
    } finally {
      handleCloseConfirm();
    }
  };

  const handleMenuClick = (event, raffleId) => {
    setAnchorEl(event.currentTarget);
    setMenuRaffleId(raffleId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRaffleId(null);
  };

  const handleRunRaffle = (raffle) => {
    setRunningRaffle(raffle);
  };

  const filteredRaffles = raffles.filter(r =>
    r.name_lottery?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (String(status)) {
      case '0': return 'success'; // Activo
      case '1': return 'warning'; // Cerrado
      case '2': return 'default'; // Finalizado
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (String(status)) {
      case '0': return 'Activo';
      case '1': return 'Cerrado';
      case '2': return 'Finalizado';
      default: return status;
    }
  };

  if (runningRaffle) {
    return (
      <SorteoFitness
        raffle={runningRaffle}
        onBack={() => {
          setRunningRaffle(null);
          fetchRaffles(); // Refresh in case winner was set
        }}
      />
    );
  }

  return (
    <Box p={2}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon color="primary" /> Gestión de Sorteos
        </Typography>

        <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }} alignItems="center">
          <Tooltip title="Recargar">
            <IconButton onClick={fetchRaffles} sx={{ transition: 'transform 1s ease', transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)' }}>
              <AutorenewIcon />
            </IconButton>
          </Tooltip>
          <TextField
            size="small"
            placeholder="Buscar sorteo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ background: theme.palette.background.paper, borderRadius: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nuevo Sorteo
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredRaffles.map((raffle) => (
          <Grid item xs={12} sm={6} md={4} key={raffle.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Chip
                    label={getStatusLabel(raffle.state_lottery)}
                    color={getStatusColor(raffle.state_lottery)}
                    size="small"
                    variant="outlined"
                  />
                  <IconButton size="small" disabled={raffle.state_lottery === '2'} onClick={(e) => handleMenuClick(e, raffle.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {raffle.name_lottery}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Premio:</strong> {raffle.prize_lottery || "Sin premio"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 20 }}>
                  <strong>Requisito:</strong> {raffle.requirement_lottery || "Sin requisitos"}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2">
                    {dayjs(raffle.start_date).format('DD MMM')} - {dayjs(raffle.expiration_date).format('DD MMM YYYY')}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <PeopleIcon fontSize="small" />
                  <Typography variant="body2">
                    {raffle.quantity_participants || 0} Participantes
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenModal(raffle)}
                  disabled={raffle.state_lottery === '2'}
                >
                  Editar
                </Button>
                <Button
                  disabled={raffle.state_lottery === '2'}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleRunRaffle(raffle)}
                >
                  Correr Sorteo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && filteredRaffles.length === 0 && (
        <Box textAlign="center" mt={4} color="text.secondary">
          <Typography variant="body1">No se encontraron sorteos.</Typography>
        </Box>
      )}

      {/* Menu for Edit/Delete */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const r = raffles.find(i => i.id === menuRaffleId);
          handleOpenModal(r);
        }}>Editar</MenuItem>
        <MenuItem onClick={handleOpenConfirm} sx={{ color: 'error.main' }}>Eliminar</MenuItem>
      </Menu>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {currentRaffle ? "Editar Sorteo" : "Nuevo Sorteo"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField
              label="Nombre del Sorteo"
              fullWidth
              value={formData.name_lottery}
              onChange={(e) => setFormData({ ...formData, name_lottery: e.target.value })}
              required
            />

            <TextField
              label="Premio"
              fullWidth
              value={formData.prize_lottery}
              onChange={(e) => setFormData({ ...formData, prize_lottery: e.target.value })}
            />

            <TextField
              label="Requisitos"
              fullWidth
              multiline
              rows={2}
              value={formData.requirement_lottery}
              onChange={(e) => setFormData({ ...formData, requirement_lottery: e.target.value })}
            />

            <TextField
              label="URL Instagram"
              fullWidth
              value={formData.url_instagram}
              onChange={(e) => setFormData({ ...formData, url_instagram: e.target.value })}
            />

            <Box display="flex" gap={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Fecha de Inicio"
                  value={formData.start_date}
                  onChange={(newValue) => setFormData({ ...formData, start_date: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="Fecha de Expiración"
                  value={formData.expiration_date}
                  onChange={(newValue) => setFormData({ ...formData, expiration_date: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>

            <TextField
              select
              label="Estado"
              fullWidth
              value={formData.state_lottery}
              onChange={(e) => setFormData({ ...formData, state_lottery: e.target.value })}
            >
              <MenuItem value="0">Activo</MenuItem>
              <MenuItem value="1">Cerrado</MenuItem>
              <MenuItem value="2">Finalizado</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación"
        contentText={`¿Estás seguro de que quieres eliminar el sorteo "${raffleToDelete?.name_lottery}"? Esta acción es irreversible.`}
      />
    </Box>
  );
};

export default AdminRaffle;
