/* eslint-disable react/prop-types */
import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { NavButton } from './NavButton';
import { useMembers } from '../context/Context';
import { useState } from 'react';
import SettingsAccount from './SettingsAccount';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import SettingsIcon from '@mui/icons-material/Settings';

const settings = ['Perfil'];

const CustomSwitch = styled(Switch)(({ theme }) => ({
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
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#e49c10',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#6164c7',
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));
// eslint-disable-next-line react/prop-types
export default function Navbar({ profile, mode, toggleTheme }) {

  const theme = useTheme();
  const themeClass = theme.palette.mode === 'dark' ? 'navbar-dark' : 'navbar-light';

  const [anchorElUser, setAnchorElUser] = useState(null);
  const { navBarOptions, setNavBarOptions } = useMembers();
  const [openSettings, setOpenSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setNavBarOptions(false);
    toast.success("Sesión cerrada satisfactoriamente", { duration: 5000 })
    setShowNav(false)
  }


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
      {showNav && <div className={`navbar ${themeClass}`}>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <div>
          <span style={{ display: "flex", alignItems: "center" }}>
            <img className="logo_mobile logo" src="/logo.png" alt="logo" />
          </span>
        </div>

        {navBarOptions && location.pathname !== "/admin" &&
          location.pathname !== "/login" &&
          location.pathname !== "/general_info" &&
          <div>
            <div className='navbar_mobile' style={{ display: "flex", justifyContent: "space-around", marginLeft: "22rem" }}>
              <NavButton to="/panel" icon={<AssessmentIcon />} text="Panel" />
              <NavButton to="/clientes" icon={<GroupsIcon />} text="Clientes" />
              <NavButton to="/entrenadores" icon={<FitnessCenterIcon />} text="Entrenadores" />
            </div>
          </div>
        }
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>

            <span className='hide' style={{ marginRight: 10 }}>{`¡Hola ${profile.name ? profile.name : "Admin"}!`}</span>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Detalles de la cuenta">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>

                  <img src={profile?.avatar ? profile.avatar : "/avatar.svg"} alt="" style={{ width: 35, height: 35, borderRadius: "50%", background: "white" }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <SettingsIcon />
                    <Typography sx={{ ml: 1, textAlign: 'center' }}>{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <CustomSwitch
              onChange={toggleTheme}
              checked={mode}
            />

            <Tooltip title="Cerrar Sesión">
              <LogoutIcon onClick={logoutUser} className='btn_logout' />
            </Tooltip>
          </div>
        </div>
        <SettingsAccount open={openSettings} handleClose={handleClose} profile={profile} />
      </div>
      }
    </>
  )
}