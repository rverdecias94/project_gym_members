/* eslint-disable react/prop-types */
import { supabase } from '../supabase/client';

import { LogOut, Settings, Receipt, Sun, Moon, LayoutDashboard, Users, Dumbbell, Store, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { NavButton } from './NavButton';
import { useMembers } from '../context/Context';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import SettingsAccountGym from './SettingsAccountGym';
import SettingsAccountShop from './SettingsAccountShop';
import PaymentHistoryModal from './PaymentHistoryModal';

const settings = [
  { name: 'Perfil', action: 'profile', icon: <Settings className="mr-2 h-4 w-4" /> },
  { name: 'Historial de pago', action: 'history', icon: <Receipt className="mr-2 h-4 w-4" /> }
];

export default function Navbar({ profile, mode, toggleTheme }) {
  const isMobile = window.innerWidth <= 768;
  const themeClass = mode ? 'navbar-dark' : 'navbar-light';
  const { navBarOptions, setNavBarOptions, daysRemaining, gymInfo, shopInfo } = useMembers();
  const [openSettings, setOpenSettings] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const accountType = localStorage.getItem("accountType");
  const hasActiveProfile = (accountType === 'gym' && gymInfo?.active) || (accountType === 'shop' && shopInfo?.active);


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
  }, [location.pathname, gymInfo.active, setNavBarOptions]);

  const logoutUser = async () => {
    try {
      let { error } = await supabase.auth.signOut();
      setNavBarOptions(false);
      // alert no mas
      setShowNav(false);
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  const handleCloseUserMenu = (action) => {
    if (action === 'profile') {
      setOpenSettings(true);
    }
    if (action === 'history') {
      setOpenHistory(true);
    }
  };

  const handleClose = () => {
    setOpenSettings(false);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
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
        <div className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-border shadow-sm ${mode ? 'bg-slate-900/80 text-white' : 'bg-primary/90 text-white'} flex flex-col`}>
          <div className="px-4 md:px-8 py-3 flex items-center justify-between w-full">
            <div className="flex items-center gap-4 w-1/3">
              <img src="/logo_platform.png" alt="Logo" className="w-[120px] h-[30px] object-contain" />
            </div>

            {!isMobile && navBarOptions && !["/admin", "/admin/panel", "/login", "/redirect", "/general_info",
              "/shop-stepper", "/bienvenido"].includes(location.pathname) && (
                <div className='hidden md:flex justify-center items-center w-1/3 min-w-max gap-4 lg:gap-8'>
                  {accountType === "gym" && <NavButton to="/panel" icon={<LayoutDashboard className="h-5 w-5" />} text="Panel" />}
                  {accountType === "gym" && <NavButton to="/clientes" icon={<Users className="h-5 w-5" />} text="Clientes" />}
                  {accountType === "gym" && <NavButton to="/entrenadores" icon={<Dumbbell className="h-5 w-5" />}
                    text="Entrenadores" />}
                  {
                    accountType === "gym" ?
                      <NavButton to="/tienda-gym" icon={<Store className="h-5 w-5" />} text="Tienda" />
                      :
                      <NavButton to="/tienda" icon={<Store className="h-5 w-5" />} text="Tienda" />
                  }
                  {accountType === "gym" && <NavButton to="/planes" icon={<TrendingUp className="h-5 w-5" />} text="Planes" />}
                </div>
              )}

            <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
              {!isMobile && profile.name && <span className='hidden lg:block font-medium'>{`¡Hola ${getName(profile.name) || "Admin"}!`}</span>}
              <div className="flex-grow-0">
                {!["/admin", "/admin/panel"].includes(location.pathname) && (
                  hasActiveProfile ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-white text-primary font-bold">
                              {profile?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        {settings.map((setting) => (
                          <DropdownMenuItem key={setting.name} onClick={() => handleCloseUserMenu(setting.action)}>
                            {setting.icon}
                            <span>{setting.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-default hover:bg-transparent">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-white text-primary font-bold">
                          {profile?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  )
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white hover:text-white/80 hover:bg-white/10">
                {!mode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={logoutUser} className="text-white hover:text-white/80 hover:bg-white/10">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {accountType === "gym" && <SettingsAccountGym open={openSettings} handleClose={handleClose} profile={profile} />
            }
            {accountType === "shop" && <SettingsAccountShop open={openSettings} handleClose={handleClose} profile={profile} />
            }
            <PaymentHistoryModal open={openHistory} onClose={handleCloseHistory} accountId={profile?.id} />
          </div>
          {daysRemaining <= 3 && daysRemaining > 0 && (
            <div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 text-white dark:text-yellow-400 text-center py-1.5 text-sm font-medium">
              Su cuenta quedará inactiva en {daysRemaining} {daysRemaining === 1 ? "día" : "días"}.
            </div>
          )}
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
