import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import MembersForm from './MembersForm';
import { Button } from "@/components/ui/button";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { supabase } from '../supabase/client';

const Welcome = () => {
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  const [gymInfo, setGymInfo] = useState(null);

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
            size="lg"
            onClick={handleOpen}
            className="px-6 py-5 text-base font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="mr-3 h-5 w-5" />
            Agregar Cliente
          </Button>
        </div>
      </div>

      <MembersForm
        open={open}
        handleClose={handleClose}
      />
    </div>
  );
};

export default Welcome;