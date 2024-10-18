import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { NavButton } from './NavButton';

// eslint-disable-next-line react/prop-types
export default function Navbar({ profile: { avatar = null, name = "Admin" } }) {

  const logoutUser = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada satisfactoriamente", { duration: 5000 })
  }

  return (
    <div className='navbar'>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <span style={{ display: "flex", alignItems: "center" }}>
        {/* <img src="/logo.png" alt="logo" style={{ position: "absolute", width: 85, height: 44, borderRadius: 5, top: 20 }} /> */}
      </span>
      <div className='navbar_mobile' style={{ display: "flex", justifyContent: "space-around" }}>
        <NavButton to="/panel" icon={<AssessmentIcon />} text="Panel" />
        <NavButton to="/clientes" icon={<GroupsIcon />} text="Clientes" />
        <NavButton to="/entrenadores" icon={<FitnessCenterIcon />} text="Entrenadores" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ marginRight: 65 }}>{`¡Hola ${name}!`}</span>
        <img src={avatar ? avatar : "/avatar.svg"} alt="avatar" style={{ width: 35, height: 35, marginRight: 20, borderRadius: "50%", position: "absolute", right: 60, top: 18 }} />
        <Tooltip title="Cerrar Sesión">
          <LogoutIcon onClick={logoutUser} className='btn_logout' />
        </Tooltip>
      </div>
    </div>
  )
}