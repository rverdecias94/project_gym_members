import { supabase } from '../supabase/client';
import { Toaster, toast } from 'react-hot-toast';
/* import { useMembers } from '../context/Context'; */
import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

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
        <img src="/logo.png" alt="logo" style={{ position: "absolute", width: 85, height: 44, borderRadius: 5, top: 20 }} />
      </span>
      <div className='navbar_mobile' style={{ display: "flex" }}>
        <Link to="/panel" style={{ color: "white", textDecoration: "none", marginLeft: 30 }}>
          <button className='btn_nav'>
            <AssessmentIcon />
            <span>
              Panel
            </span>
          </button>
        </Link>


        <Link to="/clientes" style={{ color: "white", textDecoration: "none", marginLeft: 30 }}>
          <button className='btn_nav'>
            <GroupsIcon />
            <span>
              Clientes
            </span>
          </button>
        </Link>


        <Link to="/entrenadores" style={{ color: "white", textDecoration: "none", marginLeft: 30 }}>
          <button className='btn_nav'>
            <FitnessCenterIcon />
            <span>
              Entrenadores
            </span>
          </button>
        </Link>

      </div>
      <Tooltip title="Cerrar Sesión">
        <LogoutIcon onClick={logoutUser} className='btn_logout' />
      </Tooltip>

    </div>
  )
}
