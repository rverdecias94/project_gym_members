/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Card, CardContent, Typography, CircularProgress
} from '@mui/material';
import { supabase } from '../supabase/client';
import dayjs from 'dayjs';
import { useSnackbar } from '../context/Snackbar';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Historial de Pagos</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            {history.length === 0 ? (
              <Typography variant="body1" align="center">
                No hay registros de pagos.
              </Typography>
            ) : (
              history.map((record) => (
                <Card key={record.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {record.quantity_paid} {record.currency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Pago: {dayjs(record.created_at).format('DD/MM/YYYY')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Próximo Pago: {record.next_payment_date ? dayjs(record.next_payment_date).format('DD/MM/YYYY') : 'N/A'}
                    </Typography>
                    {record.active_plan && (
                      <Typography variant="body2" color="text.secondary">
                        Plan: {record.active_plan}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentHistoryModal;
