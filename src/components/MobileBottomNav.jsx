/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Store,
  TrendingUp
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MobileBottomNav({ profile, mode, toggleTheme, logoutUser }) {
  const [value, setValue] = useState(0);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Panel', icon: <LayoutDashboard className="h-5 w-5" />, path: '/panel' },
    { label: 'Clientes', icon: <Users className="h-5 w-5" />, path: '/clientes' },
    { label: 'Staff', icon: <Dumbbell className="h-5 w-5" />, path: '/entrenadores' },
    { label: 'Tienda', icon: <Store className="h-5 w-5" />, path: '/tienda-gym' },
    { label: 'Planes', icon: <TrendingUp className="h-5 w-5" />, path: '/planes' },
  ];

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location.pathname]);

  const handleNavChange = (index, path) => {
    setValue(index);
    navigate(path);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.5)] transition-transform duration-300 translate-y-0">
      <nav className="flex justify-around items-center h-16 px-2 pb-safe">
        {navItems.map((item, index) => {
          const isActive = value === index;
          return (
            <button
              key={index}
              onClick={() => handleNavChange(index, item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive
                  ? "text-[#e49c10] font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-full transition-all duration-200",
                isActive ? "bg-[#e49c10]/10" : "bg-transparent"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive ? "font-semibold" : "font-normal"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
