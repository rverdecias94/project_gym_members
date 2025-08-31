// BackdropContext.js
import { createContext } from 'react';
import { Backdrop } from '@mui/material';
import { useMembers } from '../context/Context';

const BackdropContext = createContext();

// eslint-disable-next-line react/prop-types
export const BackdropProvider = ({ children }) => {
  const { backdrop } = useMembers();

  return (
    <BackdropContext.Provider value={{ backdrop }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 100000,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: "blur(1px)"
        }}
        open={backdrop}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="loader"></div>
        </div>
      </Backdrop>

    </BackdropContext.Provider>
  );
};

