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
        <img src="../assets/img/logo.jpg" alt="logo" style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", top: 8 }} />
        <span style={{ marginLeft: 50 }}>Gym</span>
      </span>
      <Tooltip title="Cerrar Sesión">
        <LogoutIcon onClick={logoutUser} className='btn_logout' />
      </Tooltip>

    </div>
  )
}
