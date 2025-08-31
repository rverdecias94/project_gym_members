/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  IconButton,
  Drawer,
  Box,
  Typography,
  Divider,
  Slide,
  useMediaQuery,
  useTheme,
  Switch,
  Tooltip
} from '@mui/material';

import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function MobileBottomNav({ profile, mode, toggleTheme, logoutUser }) {
  const [value, setValue] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const navItems = [
    { label: 'Panel', icon: <AssessmentIcon />, path: '/panel' },
    { label: 'Clientes', icon: <GroupsIcon />, path: '/clientes' },
    { label: 'Entrenadores', icon: <FitnessCenterIcon />, path: '/entrenadores' },
    { label: 'Tienda', icon: <LocalGroceryStoreIcon />, path: '/tienda' },
    { label: 'Planes', icon: <TrendingUpIcon />, path: '/planes' },
  ];

  const handleNavChange = (event, newValue) => {
    setValue(newValue);
    navigate(navItems[newValue].path);
  };

  if (!isMobile) return null;

  return (
    <>
      <Drawer anchor="top" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <Avatar
            src={profile?.avatar || '/avatar.svg'}
            sx={{ width: 60, height: 60, margin: '0 auto' }}
          />
          <Typography variant="h6" sx={{ mt: 1 }}>
            {profile?.name || 'Admin'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <SettingsIcon />
            <Typography>Modo oscuro</Typography>
            <Switch checked={mode} onChange={toggleTheme} />
          </Box>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={logoutUser} sx={{ mt: 2 }}>
              <LogoutIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: theme.palette.background.paper,
            zIndex: 1300,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          }}
        >

          <BottomNavigation showLabels value={value} onChange={handleNavChange}>
            {navItems.map((item, index) => (
              <BottomNavigationAction
                key={index}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Box>
      </Slide>
    </>
  );
}
