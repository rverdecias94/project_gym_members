/* eslint-disable react/prop-types */
// src/context/SnackbarContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            bgcolor:
              snackbar.severity === 'success'
                ? '#DFF6E1' // verde pastel
                : snackbar.severity === 'error'
                  ? '#FFE0E0' // rojo pastel
                  : snackbar.severity === 'warning'
                    ? '#FFF4D1' // amarillo pastel
                    : '#E0F0FF', // azul pastel para info
            color:
              snackbar.severity === 'success'
                ? '#2E7D32'
                : snackbar.severity === 'error'
                  ? '#C62828'
                  : snackbar.severity === 'warning'
                    ? '#ED6C02'
                    : '#0288D1',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </SnackbarContext.Provider>
  );
};
