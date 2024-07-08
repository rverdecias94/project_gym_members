// BackdropContext.js
import { createContext } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useMembers } from '../context/Context';

const BackdropContext = createContext();

// eslint-disable-next-line react/prop-types
export const BackdropProvider = ({ children }) => {
  const { backdrop } = useMembers();


  return (
    <BackdropContext.Provider value={{ backdrop }}>
      {children}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </BackdropContext.Provider>
  );
};

