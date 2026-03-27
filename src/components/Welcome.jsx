import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import MembersForm from './MembersForm';
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] p-6 md:p-12 text-center">
      <div className="max-w-3xl w-full flex flex-col items-center gap-6 p-8 md:p-16 rounded-2xl bg-black/5 dark:bg-white/5">
        <h1 className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          🎉 ¡Bienvenido a TRONOSS!
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Nos alegra tenerte con nosotros. Desde aquí podrás gestionar tu gimnasio de forma fácil y rápida: registra a tus miembros y entrenadores.
        </p>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          También podrás ver estadísticas de tu gimnasio, como la cantidad de clientes activos, entrenadores, la relación de clientes y entrenadores y más.
        </p>

        <div className="mt-8 mb-4 w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
            ¡Vamos a hacerlo juntos!
          </h2>

          <Button
            size="lg"
            onClick={handleOpen}
            className="px-8 py-6 text-lg font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="mr-3 h-6 w-6" />
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