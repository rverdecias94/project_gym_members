import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';


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
      <span>Super Gym</span>
      <button className='btn_logout' onClick={logoutUser}>
        Cerrar
      </button>
    </div>
  )
}
