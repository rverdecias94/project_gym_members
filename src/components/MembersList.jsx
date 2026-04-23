import { useEffect, useState } from 'react';
import { useMembers } from '../context/Context';
import { TableMembersList } from './TableMembersList';
import { MembersInactive } from './MembersInactive';
import { TablePendingPay } from './TablePendingPay';
import { TablePagoRetardado } from './TablePagoRetardado';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function MembersList() {
  const { membersList, getMembers, getTrainers } = useMembers();
  const [value, setValue] = useState("activos");
  const [membersStatus, setMembersStatus] = useState({ active: [], inactive: [] });
  const [membersPendingPayment, setMembersPendingPayment] = useState([]);
  const [membersPaymentDelayed, setMembersPaymentDelayed] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getMembers();
    getTrainers();
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getMembers(true);
      await getTrainers(true);
      toast.success("Datos actualizados correctamente");
    } catch (error) {
      toast.error("Error al actualizar los datos");
    } finally {
      setIsRefreshing(false);
    }
  };

  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }
  function getEndOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() + (day === 0 ? 0 : 7 - day); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }

  function isInCurrentWeek(dateString) {
    const today = new Date();
    const startDate = getStartOfWeek(today);
    const endDate = getEndOfWeek(today);
    const dateToCheck = new Date(dateString);

    return dateToCheck >= startDate && dateToCheck <= endDate;
  }
  function filterObjectsByCurrentWeek(objects) {
    return objects.filter(obj => isInCurrentWeek(new Date(obj.pay_date)));
  }

  function latePayment(dateString) {
    const today = new Date();
    const dateToCheck = new Date(dateString);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateToCheckDate = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
    return dateToCheckDate < todayDate;
  }

  function filterObjectsLatePayment(objects) {
    return objects.filter(obj => latePayment(new Date(obj.pay_date)));
  }

  useEffect(() => {
    const paymentInCurrentWeek = filterObjectsByCurrentWeek(membersList);
    const delayedPayment = filterObjectsLatePayment(membersList);

    const filteredPaymentInCurrentWeek = paymentInCurrentWeek.filter(member => {
      return !delayedPayment.some(p => p.id === member.id);
    });

    setMembersPaymentDelayed(delayedPayment);
    setMembersPendingPayment(filteredPaymentInCurrentWeek);

    const membersStatusObj = membersList?.reduce((acc, obj) => {
      if (obj.active) {
        acc.active.push(obj);
      } else {
        acc.inactive.push(obj);
      }
      return acc;
    }, { active: [], inactive: [] });
    setMembersStatus(membersStatusObj);
  }, [membersList])

  return (
    <div className="w-full p-4 max-w-[1400px] mx-auto mt-20 md:mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Clientes</h1>
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
      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start gap-1 sm:grid sm:grid-cols-4 sm:overflow-visible mb-6">
          <TabsTrigger value="activos" className="shrink-0 min-w-[120px] sm:min-w-0 gap-2">
            Activos
          </TabsTrigger>
          <TabsTrigger value="por-pagar" className="shrink-0 min-w-[120px] sm:min-w-0 gap-2">
            Por pagar
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold bg-primary text-primary-foreground dark:bg-yellow-500 dark:text-black">
              {membersPendingPayment.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="atrasado" className="shrink-0 min-w-[140px] sm:min-w-0 gap-2">
            Pago atrasado
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold bg-primary text-primary-foreground dark:bg-yellow-500 dark:text-black">
              {membersPaymentDelayed.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="inactivos" className="shrink-0 min-w-[120px] sm:min-w-0 gap-2">
            Inactivos
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold bg-primary text-primary-foreground dark:bg-yellow-500 dark:text-black">
              {membersStatus?.inactive?.length ?? 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-6">
          <TableMembersList membersList={membersStatus?.active || []} />
        </TabsContent>

        <TabsContent value="por-pagar" className="mt-6">
          <TablePendingPay membersPendingPayment={membersPendingPayment} />
        </TabsContent>

        <TabsContent value="atrasado" className="mt-6">
          <TablePagoRetardado membersPaymentDelayed={membersPaymentDelayed} />
        </TabsContent>

        <TabsContent value="inactivos" className="mt-6">
          <MembersInactive membersList={membersStatus?.inactive || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MembersList
