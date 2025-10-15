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
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavButton } from './NavButton';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import { useSnackbar } from '../context/Snackbar';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsAccountGym from './SettingsAccountGym';
import SettingsAccountShop from './SettingsAccountShop';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const settings = ['Perfil'];

/* const CustomSwitch = styled(Switch)(() => ({
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
})); */

export default function Navbar({ profile, mode, toggleTheme }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeClass = theme.palette.mode === 'dark' ? 'navbar-dark' : 'navbar-light';
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { navBarOptions, setNavBarOptions, daysRemaining, gymInfo } = useMembers();
  const [openSettings, setOpenSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { showMessage } = useSnackbar();
  const accountType = localStorage.getItem("accountType")


  useEffect(() => {
    if (!["/admin", "/admin/panel", "/login", "/redirect", "/general_info", "/shop-stepper", "/bienvenido"].includes(location.pathname)) {
      if (location.pathname === "/planes" && (gymInfo.active))
        setNavBarOptions(true);
      else if (location.pathname === "/planes" && (!gymInfo.active))
        setNavBarOptions(false);
      else
        setNavBarOptions(true);
    } else {
      setNavBarOptions(false);
    }
  }, [location.pathname]);

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
    setAnchorElUser(null);
    setOpenSettings(false);
  };

  const getName = (name) => {
    if (name && name.length > 0) {
      let splitedName = name.split(" ");
      return splitedName[0]
    }
  }

  return (
    <>
      {showNav && (
        <div className={`${navBarOptions ? isMobile ? "navbar-mobile" : "navbar" : "navbar-links-out"} ${themeClass}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <img src="/logo_platform.png" alt="Logo" style={{ width: 120, height: 30 }} />
          </div>

          {
            !isMobile && daysRemaining <= 3 && daysRemaining > 0 &&
            <span style={{ position: 'absolute', marginLeft: "4rem" }}>
              Su cuenta quedará inactiva en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
            </span>
          }


          {!isMobile && navBarOptions && !["/admin", "/admin/panel", "/login", "/redirect", "/general_info",
            "/shop-stepper", "/bienvenido"].includes(location.pathname) && (
              <div className='navbar_mobile' style={{ display: "flex", justifyContent: "space-around" }}>
                {accountType === "gym" && <NavButton to="/panel" icon={<AssessmentIcon />} text="Panel" />}
                {accountType === "gym" && <NavButton to="/clientes" icon={<GroupsIcon />} text="Clientes" />}
                {accountType === "gym" && <NavButton to="/entrenadores" icon={<FitnessCenterIcon />}
                  text="Entrenadores" />}
                {
                  accountType === "gym" ?
                    <NavButton to="/tienda-gym" icon={<LocalGroceryStoreIcon />} text="Tienda" />
                    :
                    <NavButton to="/tienda" icon={<LocalGroceryStoreIcon />} text="Tienda" />
                }
                {accountType === "gym" && <NavButton to="/planes" icon={<TrendingUpIcon />} text="Planes" />}
              </div>
            )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
            {!isMobile && <span className='hide'>{`¡Hola ${getName(profile.name) || "Admin"}!`}</span>}
            <Box sx={{ flexGrow: 0 }}>
              {!["/admin", "/admin/panel"].includes(location.pathname) && (
                <>
                  <Tooltip title="Detalles de la cuenta">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <span style={{ width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "white", color: theme.palette.mode !== 'dark' ? "#4f52b2d0" : "#0a1628c8" }}>{profile?.name?.charAt(0).toUpperCase()}</span>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleClose}
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

            <Tooltip title={!mode ? "Modo Claro" : "Modo Oscuro"}>
              <IconButton onClick={toggleTheme} sx={{ p: 0, color: "inherit" }}>
                {!mode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Cerrar Sesión">
              <IconButton onClick={logoutUser}>
                <LogoutIcon className='btn_logout' />
              </IconButton>
            </Tooltip>
          </div>

          {accountType === "gym" && <SettingsAccountGym open={openSettings} handleClose={handleClose} profile={profile} />
          }
          {accountType === "shop" && <SettingsAccountShop open={openSettings} handleClose={handleClose} profile={profile} />
          }
        </div>
      )}

      {isMobile && showNav && navBarOptions && accountType === "gym" && !["/admin", "/login", "/admin/panel", "/redirect", "/shop-stepper", "/general_info", "/bienvenido"].includes(location.pathname) && (
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
