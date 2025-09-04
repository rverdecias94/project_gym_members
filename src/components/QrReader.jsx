import { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { Box, Typography, Alert, Button } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import PropTypes from 'prop-types';

const QrReader = ({ onScanSuccess, onToggleMode }) => {
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      // En la versión 0.0.8, 'data' ya contiene el valor del QR como un string
      onScanSuccess(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    // Para esta versión, el manejo de errores es más básico
    setError('Error al escanear. Por favor, asegúrate de que la cámara esté habilitada.');
  };

  const previewStyle = {
    height: 240,
    width: 320,
    objectFit: 'cover'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <QrScanner
        delay={300}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Escaneando...
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={onToggleMode}
        sx={{ mt: 2 }}
      >
        <LinkIcon /> <span style={{ marginLeft: '5px' }}>Escribir ID</span>
      </Button>
    </Box>
  );
};

QrReader.propTypes = {
  onScanSuccess: PropTypes.func.isRequired,
  onToggleMode: PropTypes.func.isRequired,
};

export default QrReader;