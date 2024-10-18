import { useState } from 'react';
import { supabase } from "../supabase/client";
import { Button, TextField, Typography, Select, MenuItem } from '@mui/material';


const PhoneSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [label, setLabel] = useState("Teléfono");
  const countryCode = '+53';

  const validatePhoneNumber = (number) => {
    const errors = [];
    if (!/^\d+$/.test(number) || number.length !== 8 || !number.startsWith('5')) {
      setLabel('Teléfono inválido');
    } else
      setLabel('Teléfono');


    return errors;
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  const handleSendOtp = async () => {
    validatePhoneNumber(phoneNumber);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: countryCode + phoneNumber,
      });
      if (error) {
        setErrorMessage(error.message);
        throw error;
      }
      setOtpSent(true);
    } catch (error) {
      console.error('Error al enviar el código OTP:', error.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        phone: countryCode + phoneNumber,
        token: otpCode,
        type: 'sms',
      });
      console.log(session);
      if (error) {
        setErrorMessage(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error al verificar el código OTP:', error.message);
    }
  };

  return (
    <div>
      <Typography variant="h6">Iniciar sesión con Teléfono</Typography>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <br />
      {!otpSent ? (
        <div>
          <div style={{ display: "flex", gap: 2 }}>
            <Select
              value={countryCode}
              displayEmpty
              renderValue={() => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src='/Flag_of_Cuba.svg'
                    alt="Cuba"
                    style={{ width: 24, height: 16, marginRight: 8 }}
                  />
                  {countryCode}
                </div>
              )}
              disabled
            >
              <MenuItem value={countryCode}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="/Flag_of_Cuba.svg"
                    alt="Cuba"
                    style={{ width: 24, height: 16, marginRight: 8 }}
                  />
                  {countryCode}
                </div>
              </MenuItem>
            </Select>
            <TextField
              label={label}
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="52148973"
              fullWidth
              error={label === "Teléfono inválido"}
              inputProps={{ maxLength: 8 }}
            />
          </div>

          <Button
            variant="contained"
            onClick={handleSendOtp}
            style={{ marginTop: '20px' }}
            disabled={label === "Teléfono inválido"}
          >
            Enviar Código
          </Button>
        </div>
      ) : (
        <div>
          <TextField
            label="Código OTP"
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Introduce el código OTP"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            style={{ marginTop: '20px' }}
          >
            Verificar OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhoneSignIn;

