import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { useSnackbar } from '../context/Snackbar';

const INACTIVITY_TIME = 4 * 60 * 60 * 1000; // 4h en milisegundos (para pruebas)
const COUNTDOWN_TIME = 5 * 60; // 5 minutos en segundos

const SessionManager = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const countdownIntervalRef = useRef(null);
  const lastActivityTimeRef = useRef(Date.now());
  const isLoggingOutRef = useRef(false);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;

    isLoggingOutRef.current = true;
    try {
      await supabase.auth.signOut();
      showMessage('Sesión cerrada por inactividad', 'info');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [navigate, showMessage]);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setCountdown(COUNTDOWN_TIME);
    const endTime = Date.now() + COUNTDOWN_TIME * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
      setCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        countdownIntervalRef.current = null;
        setShowDialog(false);
        logout();
      }
    }, 250);

    countdownIntervalRef.current = interval;
  }, [logout]);

  const keepSession = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowDialog(false);
    lastActivityTimeRef.current = Date.now();
    showMessage('Sesión mantenida activa', 'success');
  }, [showMessage]);

  const closeSession = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowDialog(false);
    logout();
  }, [logout]);

  const recordUserActivity = useCallback(() => {
    if (!showDialog) {
      lastActivityTimeRef.current = Date.now();
    }
  }, [showDialog]);

  const checkInactivity = useCallback(() => {
    if (showDialog) return;

    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTimeRef.current;

    if (timeSinceLastActivity >= INACTIVITY_TIME) {
      setShowDialog(true);
      startCountdown();
    }
  }, [showDialog, startCountdown]);

  useEffect(() => {
    if (showDialog) startCountdown();
  }, [showDialog, startCountdown]);

  useEffect(() => {
    const inactivityChecker = setInterval(checkInactivity, 5000);
    return () => clearInterval(inactivityChecker);
  }, [checkInactivity]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];

    events.forEach(event => window.addEventListener(event, recordUserActivity, { passive: true }));

    lastActivityTimeRef.current = Date.now();

    return () => {
      events.forEach(event => window.removeEventListener(event, recordUserActivity));
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [recordUserActivity]);

  // 🔹 Función para formatear segundos a "M:SS"
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showDialog} disableEscapeKeyDown style={{ zIndex: 9999 }}>
      <DialogTitle>¿Deseas mantener tu sesión activa?</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Tu sesión se cerrará automáticamente por inactividad en:
        </Typography>
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography variant="h3" color="primary">
            {formatTime(countdown)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            minutos
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(countdown / COUNTDOWN_TIME) * 100}
          color="warning"
          sx={{ height: 10, borderRadius: 5 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeSession} color="error" variant="outlined">
          Cerrar Sesión
        </Button>
        <Button onClick={keepSession} color="primary" variant="contained" autoFocus>
          Mantener Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionManager;
