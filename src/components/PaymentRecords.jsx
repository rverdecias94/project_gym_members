/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import dayjs from 'dayjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Receipt, CheckCircle2, XCircle } from 'lucide-react';

const PaymentRecords = ({ open, handleClose, memberInfo }) => {
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPaymentsRecords = async () => {
      if (!memberInfo?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("payment_history_members")
          .select("*")
          .eq("member_id", memberInfo.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching payment records:", error);
          return;
        }

        setPaymentsList(data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (open && memberInfo) {
      getPaymentsRecords();
    }
  }, [memberInfo, open])

  const formatCurrency = (amount, currency) => {
    return `${Number(amount).toLocaleString()} ${currency}`;
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 md:p-6 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <Receipt className="w-5 h-5 mr-2 text-primary" />
            Historial de Pagos - {memberInfo?.first_name} {memberInfo?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-6 overflow-y-auto bg-background flex-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : paymentsList?.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium border-b border-border">Fecha de Pago</th>
                        <th className="px-4 py-3 font-medium border-b border-border">Próximo Pago</th>
                        <th className="px-4 py-3 font-medium border-b border-border">Cantidad Pagada</th>
                        <th className="px-4 py-3 font-medium border-b border-border">Moneda</th>
                        <th className="px-4 py-3 font-medium border-b border-border">Incluye Entrenador</th>
                        <th className="px-4 py-3 font-medium border-b border-border">Fecha de Registro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paymentsList.map((payment) => (
                        <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-foreground">
                            {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {payment.next_payment ? formatDate(payment.next_payment) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {formatCurrency(payment.quantity_paid, payment.currency)}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {payment.currency}
                          </td>
                          <td className="px-4 py-3">
                            {payment.trainer_included ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Sí
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                <XCircle className="w-3 h-3 mr-1" /> No
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Información resumida */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-foreground">
                  <strong>Resumen:</strong> {paymentsList.length} pago(s) registrado(s)
                </span>
                <span className="text-lg font-bold text-primary dark:text-complementary">
                  Total pagado: {formatCurrency(
                    paymentsList.reduce((sum, payment) => sum + Number(payment.quantity_paid), 0),
                    paymentsList[0]?.currency || 'CUP'
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">Sin registros</p>
              <p className="text-muted-foreground">No hay registros de pago para este cliente</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentRecords