import { Button, SvgIcon } from "@mui/material";
import { supabase } from "../supabase/client";

const GoogleSignIn = () => {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });

    if (error) {
      console.error('Error al iniciar sesión con Google:', error.message);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      variant="outlined"
      startIcon={
        <SvgIcon viewBox="0 0 48 48" style={{ fontSize: '24px' }}>
          <path fill="#EA4335" d="M24 9.5c3.28 0 5.47 1.44 6.69 2.65l4.9-4.87C32.72 4.87 28.81 3 24 3 14.95 3 7.48 8.64 4.58 16.36l5.83 4.53C12.15 13.03 17.56 9.5 24 9.5z" />
          <path fill="#34A853" d="M46.16 24.55c0-1.49-.13-2.94-.36-4.36H24v8.26h12.5c-.54 2.77-2.15 5.1-4.6 6.66l5.81 4.5c3.39-3.12 5.45-7.72 5.45-13.06z" />
          <path fill="#4A90E2" d="M8.56 29.37c-1.21-1.44-1.91-3.24-1.91-5.37 0-2.13.7-3.93 1.91-5.37l-5.83-4.53C1.43 17.77 0 21.72 0 24c0 2.28 1.43 6.23 4.58 10.9l5.83-4.53z" />
          <path fill="#FBBC05" d="M24 46c4.81 0 8.72-1.58 11.63-4.3l-5.82-4.5c-1.63 1.12-3.71 1.81-5.81 1.81-6.44 0-11.85-3.53-14.43-8.87l-5.83 4.53C7.48 39.36 14.95 45 24 45z" />
        </SvgIcon>
      }
      style={{
        width: '100%',
        padding: '10px 0',
        fontSize: '16px',
        color: '#444',
        borderColor: '#dadce0',
        backgroundColor: '#fff',
      }}
    >
      Iniciar sesión con Google
    </Button>
  );
};

export default GoogleSignIn;