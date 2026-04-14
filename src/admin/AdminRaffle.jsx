import { useState, useEffect } from "react";
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { useSnackbar } from "../context/Snackbar";
import SorteoFitness from "./Sorteo";
import ConfirmationDialog from "../components/ConfirmationDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";

import { Trophy, Plus, Search, CalendarDays, Users, Play, RefreshCw, MoreVertical } from "lucide-react";

const AdminRaffle = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showMessage } = useSnackbar();
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
    start_date: "",
    expiration_date: "",
    state_lottery: "0" // 0: Activo, 1: Cerrado, 2: Finalizado
  });

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
        start_date: raffle.start_date ? dayjs(raffle.start_date).format('YYYY-MM-DD') : "",
        expiration_date: raffle.expiration_date ? dayjs(raffle.expiration_date).format('YYYY-MM-DD') : "",
        state_lottery: String(raffle.state_lottery)
      });
    } else {
      setCurrentRaffle(null);
      setFormData({
        name_lottery: "",
        prize_lottery: "",
        requirement_lottery: "",
        url_instagram: "",
        start_date: dayjs().format('YYYY-MM-DD'),
        expiration_date: dayjs().add(1, 'month').format('YYYY-MM-DD'),
        state_lottery: "0"
      });
    }
    setOpenModal(true);
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
      start_date: formData.start_date,
      expiration_date: formData.expiration_date,
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

  const handleOpenConfirm = (raffleData) => {
    setRaffleToDelete(raffleData);
    setOpenConfirm(true);
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

  const handleRunRaffle = (raffle) => {
    setRunningRaffle(raffle);
  };

  const filteredRaffles = raffles.filter(r =>
    r.name_lottery?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (String(status)) {
      case '0': return 'default'; // Activo (primary in shadcn default badge)
      case '1': return 'secondary'; // Cerrado
      case '2': return 'outline'; // Finalizado
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
    <div className="p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-primary h-6 w-6" /> Gestión de Sorteos
        </h2>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          <Button variant="ghost" size="icon" onClick={fetchRaffles}>
            <RefreshCw className={`h-5 w-5 ${rotate ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sorteo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleOpenModal()} className="whitespace-nowrap flex gap-2">
            <Plus className="h-4 w-4" /> Nuevo Sorteo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredRaffles.map((raffle) => (
          <Card key={raffle.id} className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={getStatusColor(raffle.state_lottery)}>
                  {getStatusLabel(raffle.state_lottery)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={raffle.state_lottery === '2'}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenModal(raffle)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleOpenConfirm(raffle)}>Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl">{raffle.name_lottery}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Premio:</span> {raffle.prize_lottery || "Sin premio"}
              </div>
              <div className="text-sm text-muted-foreground min-h-[40px]">
                <span className="font-semibold text-foreground">Requisito:</span> {raffle.requirement_lottery || "Sin requisitos"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{dayjs(raffle.start_date).format('DD MMM')} - {dayjs(raffle.expiration_date).format('DD MMM YYYY')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{raffle.quantity_participants || 0} Participantes</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(raffle)}
                disabled={raffle.state_lottery === '2'}
              >
                Editar
              </Button>
              <Button
                size="sm"
                className="flex gap-2"
                onClick={() => handleRunRaffle(raffle)}
                disabled={raffle.state_lottery === '2'}
              >
                <Play className="h-4 w-4" /> Correr Sorteo
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && filteredRaffles.length === 0 && (
        <div className="text-center mt-10 text-muted-foreground">
          No se encontraron sorteos.
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentRaffle ? "Editar Sorteo" : "Nuevo Sorteo"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name_lottery">Nombre del Sorteo *</Label>
              <Input
                id="name_lottery"
                value={formData.name_lottery}
                onChange={(e) => setFormData({ ...formData, name_lottery: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prize_lottery">Premio</Label>
              <Input
                id="prize_lottery"
                value={formData.prize_lottery}
                onChange={(e) => setFormData({ ...formData, prize_lottery: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requirement_lottery">Requisitos</Label>
              <Input
                id="requirement_lottery"
                value={formData.requirement_lottery}
                onChange={(e) => setFormData({ ...formData, requirement_lottery: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url_instagram">URL Instagram</Label>
              <Input
                id="url_instagram"
                value={formData.url_instagram}
                onChange={(e) => setFormData({ ...formData, url_instagram: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Fecha de Inicio *</Label>
                <DatePicker
                  id="start_date"
                  value={formData.start_date}
                  max={formData.expiration_date || undefined}
                  onChange={(val) => setFormData({ ...formData, start_date: val })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiration_date">Fecha de Expiración *</Label>
                <DatePicker
                  id="expiration_date"
                  value={formData.expiration_date}
                  min={formData.start_date || undefined}
                  onChange={(val) => setFormData({ ...formData, expiration_date: val })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.state_lottery}
                onValueChange={(value) => setFormData({ ...formData, state_lottery: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Activo</SelectItem>
                  <SelectItem value="1">Cerrado</SelectItem>
                  <SelectItem value="2">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación"
        contentText={`¿Estás seguro de que quieres eliminar el sorteo "${raffleToDelete?.name_lottery}"? Esta acción es irreversible.`}
      />
    </div>
  );
};

export default AdminRaffle;
