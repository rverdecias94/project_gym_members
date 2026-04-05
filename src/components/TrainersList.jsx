/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useMembers } from '../context/Context';
import { TableTrainersList } from './TableTrainersList';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';


function Trainers() {
  const { trainersList, getTrainers } = useMembers();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getTrainers();
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getTrainers(true);
      toast.success("Entrenadores actualizados correctamente");
    } catch (error) {
      toast.error("Error al actualizar entrenadores");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full p-4 max-w-[1400px] mx-auto mt-20 md:mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Entrenadores</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 w-10"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <TableTrainersList trainersList={trainersList} />
    </div>
  )
}

export default Trainers