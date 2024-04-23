import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
/* import { useMembers } from '../context/Context'; */
import LogoutIcon from '@mui/icons-material/Logout';

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
        <img src="/public/images/logo.jpg" alt="logo" style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", top: 8 }} />
        <span style={{ marginLeft: 50 }}>Gym</span>
      </span>
      <LogoutIcon onClick={logoutUser} className='btn_logout' />

    </div>
  )
}
