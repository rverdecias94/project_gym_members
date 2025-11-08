/* eslint-disable react/prop-types */
// PaymentModal.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Grid,
  Typography,
  Divider
} from '@mui/material';
import { useMembers } from '../context/Context';
import dayjs from 'dayjs';

const PaymentModal = ({ open, handleClose, member }) => {
  const { registerPayment, gymInfo, trainersList, adding } = useMembers();
  const [paymentData, setPaymentData] = useState({
    trainer_name: '',
    months: 1,
    pay_date: ''
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Precios reales del gimnasio
  const gymPrice = gymInfo?.monthly_payment || 0;
  const trainerPrice = gymInfo?.trainers_cost || 0;
  const gymCurrency = gymInfo?.monthly_currency || 'CUP';
  const trainerCurrency = gymInfo?.trainer_currency || 'CUP';

  useEffect(() => {
    if (member) {
      setPaymentData({
        trainer_name: member.trainer_name || '',
        months: 1,
        pay_date: dayjs(new Date()).format('YYYY-MM-DD') || member.pay_date
      });
    }
  }, [member]);

  useEffect(() => {
    // Calcular el total basado en los precios reales
    const hasTrainer = paymentData.trainer_name && paymentData.trainer_name !== '';
    const baseAmount = gymPrice * paymentData.months;
    const trainerAmount = hasTrainer ? trainerPrice * paymentData.months : 0;
    setTotalAmount(baseAmount + trainerAmount);
  }, [paymentData.months, paymentData.trainer_name, gymPrice, trainerPrice]);

  const handleSubmit = async () => {
    const hasTrainer = paymentData.trainer_name && paymentData.trainer_name !== '';

    await registerPayment(
      { ...member, trainer_name: paymentData.trainer_name },
      paymentData.months,
      hasTrainer
    );
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e090',
      }}>
        Registrar Pago
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Información del cliente */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información del Cliente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={member?.first_name || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={member?.last_name || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CI"
                  value={member?.ci || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={member?.phone || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fecha de último pago"
                  value={member?.pay_date ? dayjs(member.pay_date).format('DD/MM/YYYY') : ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Configuración del pago */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Configuración del Pago
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Entrenador"
                  name="trainer_name"
                  value={paymentData.trainer_name}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value="">Sin Entrenador</MenuItem>
                  {trainersList.map((trainer) => (
                    <MenuItem key={trainer.id} value={trainer.name}>
                      {trainer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Meses a pagar:
                </Typography>
                <RadioGroup
                  row
                  name="months"
                  value={paymentData.months}
                  onChange={handleChange}
                >
                  <FormControlLabel value={1} control={<Radio />} label="1 mes" />
                  <FormControlLabel value={2} control={<Radio />} label="2 meses" />
                  <FormControlLabel value={3} control={<Radio />} label="3 meses" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Fecha de Pago"
                  value={paymentData.pay_date ?
                    dayjs(paymentData.pay_date).add(paymentData.months, 'month').format('DD/MM/YYYY') : ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  helperText={`Fecha calculada automáticamente (un mes posterior a la fecha actual)`}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Resumen del pago */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pago
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography>Membresía ({paymentData.months} mes):</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography>{gymPrice * paymentData.months} {gymCurrency}</Typography>
              </Grid>

              {paymentData.trainer_name && (
                <>
                  <Grid item xs={6}>
                    <Typography>Entrenador ({paymentData.months} mes):</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>{trainerPrice * paymentData.months} {trainerCurrency}</Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="h6" color="primary">
                  {totalAmount} {gymCurrency}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={adding}
              sx={{ backgroundColor: '#e49c10', color: 'white' }}
            >
              {adding ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;