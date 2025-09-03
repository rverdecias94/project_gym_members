import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { Box, Typography, Alert, Button } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import PropTypes from 'prop-types';

const QrReader = ({ onScanSuccess, onToggleMode }) => {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Escaneando...');

  const { ref } = useZxing({
    onResult(result) {
      if (result) {
        onScanSuccess(result.getText());
      }
    },
    onError(err) {
      console.error(err);
      setError('Error al escanear: ' + err.name);
      setStatus('Error');
    },
    onDecodeError() {
      // Decode errors happen frequently and can be ignored
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <video ref={ref} style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {status}
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