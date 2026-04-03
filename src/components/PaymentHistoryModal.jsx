/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { useSnackbar } from '../context/Snackbar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PaymentHistoryModal = ({ open, onClose, accountId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accountId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payment_history_customer')
          .select('*')
          .eq('uid_customer', accountId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        showMessage("Error al cargar el historial de pagos", "error");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchHistory();
    }
  }, [open, accountId, showMessage]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Historial de Pagos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 bg-muted/20">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay registros de pagos.
                </div>
              ) : (
                history.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg text-primary dark:text-complementary">
                          {record.quantity_paid}
                        </div>
                        {record.active_plan && (
                          <Badge variant="outline" className="bg-background">
                            {record.active_plan}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Fecha de Pago</span>
                          <span className="font-medium">{dayjs(record.created_at).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Próximo Pago</span>
                          <span className="font-medium">
                            {record.next_payment_date ? dayjs(record.next_payment_date).format('DD/MM/YYYY') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryModal;
