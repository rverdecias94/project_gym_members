/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip
} from '@mui/material'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

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
          .eq("member_id", memberInfo.id) // Cambiado de "id" a "member_id"
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
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title" sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h6">
          Historial de Pagos - {memberInfo?.first_name} {memberInfo?.last_name}
        </Typography>
        <IconButton
          aria-label="close"
          size="large"
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Typography>Cargando historial de pagos...</Typography>
        ) : paymentsList?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="historial de pagos">
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell><strong>Fecha de Pago</strong></TableCell>
                  <TableCell><strong>Próximo Pago</strong></TableCell>
                  <TableCell><strong>Cantidad Pagada</strong></TableCell>
                  <TableCell><strong>Moneda</strong></TableCell>
                  <TableCell><strong>Incluye Entrenador</strong></TableCell>
                  <TableCell><strong>Fecha de Registro</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentsList.map((payment, index) => (
                  <TableRow
                    key={payment.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                    }}
                  >
                    <TableCell>
                      {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {payment.next_payment ? formatDate(payment.next_payment) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(payment.quantity_paid, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.trainer_included ? "Sí" : "No"}
                        color={payment.trainer_included ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            variant="h6"
            align="center"
            sx={{
              py: 4,
              color: 'text.secondary'
            }}
          >
            No hay registros de pago para este cliente
          </Typography>
        )}

        {/* Información resumida */}
        {paymentsList.length > 0 && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Resumen:</strong> {paymentsList.length} pago(s) registrado(s)
            </Typography>
            <Typography variant="body2">
              Total pagado: {formatCurrency(
                paymentsList.reduce((sum, payment) => sum + Number(payment.quantity_paid), 0),
                paymentsList[0]?.currency || 'CUP'
              )}
            </Typography>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PaymentRecords