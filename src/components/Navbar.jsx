import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
import { useMembers } from '../context/MembersContext';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export default function Navbar() {

  const obj = useMembers();

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
      <span>
        <FitnessCenterIcon />
        <span>Super Gym</span>
      </span>
      <LogoutIcon onClick={logoutUser} className='btn_logout' />

    </div>
  )
}
