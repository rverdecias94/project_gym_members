import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
/* import { useMembers } from '../context/Context'; */
import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip } from '@mui/material';

export default function Navbar() {
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
        <img src="/img/logo.png" alt="logo" style={{ position: "absolute", width: 85, height: 30, borderRadius: 4, top: 8 }} />
        <span style={{ marginTop: 25, fontFamily: "monospace", width: 88, textAlign: "center" }}>Gym Manager</span>
      </span>
      <Tooltip title="Cerrar Sesión">
        <LogoutIcon onClick={logoutUser} className='btn_logout' />
      </Tooltip>

    </div>
  )
}
