/* eslint-disable react/prop-types */
import { supabase } from '../supabase/client';

import LogoutIcon from '@mui/icons-material/Logout';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  Switch
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavButton } from './NavButton';
import { useMembers } from '../context/Context';
import { useState } from 'react';
import SettingsAccount from './SettingsAccount';
import { useTheme, styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import { useSnackbar } from '../context/Snackbar';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

const settings = ['Perfil'];

const CustomSwitch = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#8796A5',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#e49c10',
    width: 32,
    height: 32,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}));

export default function Navbar({ profile, mode, toggleTheme }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeClass = theme.palette.mode === 'dark' ? 'navbar-dark' : 'navbar-light';
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { navBarOptions, setNavBarOptions, daysRemaining } = useMembers();
  const [openSettings, setOpenSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { showMessage } = useSnackbar();




  const logoutUser = async () => {
    try {
      let { error } = await supabase.auth.signOut();
      setNavBarOptions(false);
      showMessage("Sesión cerrada satisfactoriamente", "success");
      setShowNav(false);
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    setOpenSettings(true);
  };

  const handleClose = () => {
    setOpenSettings(false);
  };



  return (
    <>
      {showNav && (
        <div className={`navbar ${themeClass}`}>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40 }} />
          </div>

          {
            !isMobile && daysRemaining <= 3 &&
            <span style={{ position: 'absolute', marginLeft: "4rem" }}>
              Su cuenta quedará inactiva en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
            </span>
          }


          {!isMobile && navBarOptions && !["/admin", "/admin/panel", "/login", "/general_info", "/bienvenido"].includes(location.pathname) && (
            <div className='navbar_mobile' style={{ display: "flex", justifyContent: "space-around", marginLeft: "22rem" }}>
              <NavButton to="/panel" icon={<AssessmentIcon />} text="Panel" />
              <NavButton to="/clientes" icon={<GroupsIcon />} text="Clientes" />
              <NavButton to="/entrenadores" icon={<FitnessCenterIcon />}
                text="Entrenadores" />
              <NavButton to="/tienda" icon={<LocalGroceryStoreIcon />} text="Tienda" />

            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isMobile && <span className='hide'>{`¡Hola ${profile.name || "Admin"}!`}</span>}
            <Box sx={{ flexGrow: 0 }}>
              {!["/admin", "/admin/panel"].includes(location.pathname) && (
                <>
                  <Tooltip title="Detalles de la cuenta">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <img src={profile?.avatar || "/avatar.svg"} alt="" style={{ width: 35, height: 35, borderRadius: "50%", background: "white" }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => (
                      <MenuItem key={setting} onClick={handleCloseUserMenu}>
                        <SettingsIcon />
                        <Typography sx={{ ml: 1 }}>{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )
              }
            </Box>

            <CustomSwitch onChange={toggleTheme} checked={mode} />

            <Tooltip title="Cerrar Sesión">
              <IconButton onClick={logoutUser}>
                <LogoutIcon className='btn_logout' />
              </IconButton>
            </Tooltip>
          </div>

          <SettingsAccount open={openSettings} handleClose={handleClose} profile={profile} />
        </div>
      )}

      {isMobile && showNav && !["/admin", "/login", "/admin/panel", "/general_info", "/bienvenido"].includes(location.pathname) && (
        <MobileBottomNav
          profile={profile}
          mode={mode}
          toggleTheme={toggleTheme}
          logoutUser={logoutUser}
        />
      )}
    </>
  );
}
