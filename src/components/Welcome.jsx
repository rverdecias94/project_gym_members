import { useState, useEffect } from 'react';
import { QrCode, UserPlus, Search } from 'lucide-react';
import MembersForm from './MembersForm';
import { Button } from "@/components/ui/button";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { supabase } from '../supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QrReader from './QrReader';
import { Card, CardContent } from "@/components/ui/card";
import { useMembers } from '@/context/Context';
import EditMember from './EditMember';

const Welcome = () => {
  const { setBackdrop } = useMembers();
  const [open, setOpen] = useState(false);
  const [openQrScanner, setOpenQrScanner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  const [gymInfo, setGymInfo] = useState(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [id, setId] = useState('');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const [verifiedAcount, setVerifiedAcount] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  const [associated, setAssociated] = useState(false);


  useEffect(() => {
    const fetchGymInfo = async () => {
      try {
        const cachedGymInfo = sessionStorage.getItem("gym_info");
        if (cachedGymInfo) {
          setGymInfo(JSON.parse(cachedGymInfo));
        } else {
          // Si no está en sessionStorage, intentamos obtenerlo de la base de datos
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('info_general_gym')
              .select('store')
              .eq('owner_id', user.id)
              .single();

            if (data) {
              setGymInfo(data);
            }
          }
        }
      } catch (e) {
        console.error("Error obteniendo gym_info:", e);
      }
    };

    fetchGymInfo();

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCloseEdit = () => setOpenEdit(false);


  const handleQrScanSuccess = (scannedId) => {
    setId(scannedId);
    setShowQrScanner(false);
    setResultados([]);
    setError(null);
    buscarRegistro(scannedId);
  };

  const buscarRegistro = async (value) => {
    if (value.length === 0) return

    let scannedId = value !== null && value !== undefined ? value : id;
    let tb_column = value.length === 36 ? 'member_id' : 'id'

    setBackdrop(true);
    setError(null);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq(tb_column, scannedId);

    setBackdrop(false);
    if (error) {
      setError('Error al buscar el registro');
      setResultados([]);
      setVerifiedAcount(false);
    } else if (!data || data.length === 0) {
      setError('No se encontró ningún cliente con ese ID');
      setResultados([]);
      setVerifiedAcount(false);
    } else {
      setResultados(data);
      setVerifiedAcount(true);
    }
  };

  const handleOpenEdit = (member, value = false) => {
    const normalized = {
      ...member,
      phone: member?.phone !== undefined && member?.phone !== null ? String(member.phone) : '',
    };
    setOpenEdit(true);
    setMemberInfo(normalized);
    setAssociated(value)
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(50vh-8rem)] p-4 md:p-8 text-center relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}

      <div className="max-w-3xl w-full flex flex-col items-center gap-4 p-6 md:p-10 rounded-2xl bg-black/5 dark:bg-white/5 z-10">
        <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
          🎉 ¡Bienvenido a TRONOSS!
        </h1>

        {gymInfo?.store === true ? (
          <>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Nos alegra tenerte con nosotros. Tienes el <strong>Plan Premium</strong>, lo que significa que podrás gestionar tu negocio de forma integral.
            </p>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Registra miembros y entrenadores en tu gimnasio, administra los productos y pedidos de tu tienda virtual, y visualiza estadísticas avanzadas de ambas áreas en un solo lugar.
            </p>
          </>
        ) : (
          <>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Nos alegra tenerte con nosotros. Con tu <strong>Plan Estándar</strong> podrás gestionar tu gimnasio de forma fácil y rápida.
            </p>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Registra a tus miembros, administra a tus entrenadores y visualiza estadísticas de crecimiento como la cantidad de clientes activos y la relación de clientes por entrenador.
            </p>
          </>
        )}

        <div className="mt-6 mb-2 w-full flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">
            ¡Vamos a hacerlo juntos!
          </h2>


          <Button
            className=" bg-[#e49c10] hover:bg-[#c9890e] text-white"
            onClick={() => {
              setOpenQrScanner(true);
              setShowQrScanner(false); // Asegura que se vea el formulario por defecto
            }}
          >
            <QrCode className="mr-2 h-4 w-4" />
            <span>Asociar Cliente</span>
          </Button>
          <div className='text-slate-600 dark:text-slate-300 display-flex justify-center align-center w-full'>
            <span>O</span>
          </div>
          <Button
            size="lg"
            onClick={handleOpen}
            className="px-6 py-5 text-base font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="mr-3 h-5 w-5" />
            Agregar Cliente
          </Button>

        </div>
      </div>

      <Dialog open={openQrScanner} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpenQrScanner(false);
          setShowQrScanner(false);
          setId('');
          setResultados([]);
          setError(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Asociar cliente al sistema</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {!showQrScanner ? (
              <>
                {!resultados.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="member_id">ID del Miembro</Label>
                      <div className="flex gap-2">
                        <Input
                          id="member_id"
                          placeholder="Escribe el ID"
                          value={id}
                          onChange={e => setId(e.target.value)}
                          className="flex-1"
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => buscarRegistro(id ?? null)}
                          disabled={id.length === 0}
                          className="shrink-0"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setShowQrScanner(true);
                        setId('');
                        setResultados([]);
                        setError(null);
                      }}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Escanear QR
                    </Button>
                  </>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <QrReader
                onScanSuccess={handleQrScanSuccess}
                onToggleMode={() => setShowQrScanner(false)}
              />
            )}

            <div className="flex flex-col gap-2 mt-4">
              {resultados.map(registro => (
                <Card key={registro.id}>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <p><strong>Nombre:</strong> {registro.first_name}</p>
                    <p><strong>Apellido:</strong> {registro.last_name}</p>
                    <Button
                      className="mt-2 bg-[#e49c10] hover:bg-[#c9890e] text-white w-full"
                      onClick={() => handleOpenEdit(registro, true)}
                    >
                      Detalles de Cliente
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MembersForm
        open={open}
        handleClose={handleClose}
      />

      <EditMember
        handleClose={handleCloseEdit}
        memberInfo={memberInfo}
        open={openEdit}
        virifiedAcount={verifiedAcount}
        associated={associated}
      />

    </div>
  );
};

export default Welcome;