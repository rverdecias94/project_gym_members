import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";

// eslint-disable-next-line react/prop-types
export const NavButton = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      className="no-underline outline-none focus:outline-none"
    >
      {({ isActive }) => (
        <button
          className={cn(
            "flex flex-col items-center justify-center bg-transparent border-none cursor-pointer px-4 py-2 mx-2 transition-all duration-200 border-b-4 outline-none focus:outline-none focus:ring-0",
            isActive
              ? "border-[#ffb700] text-[#ffb700] font-bold drop-shadow-md"
              : "border-transparent text-white hover:text-white/80"
          )}
        >
          <div className="mb-1">{icon}</div>
          <span className="text-sm">{text}</span>
        </button>
      )}
    </NavLink>
  );
};