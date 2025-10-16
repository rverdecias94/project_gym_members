import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { identifyAccountType } from "../services/accountType";

const Redirect = () => {

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('uuid', user.id);
      if (error) {
        navigate('/login');
        return;
      } else if (data.length > 0) {
        navigate('/admin/panel');
        return;
      }
      // Identificar el tipo de cuenta
      const { type } = await identifyAccountType(user.id);
      switch (type) {
        case 'gym':
          navigate('/general_info');
          break;

        case 'shop':
          navigate('/shop-stepper');
          break;

        case 'none':
        default:
          // Si no tiene cuenta, mostrar planes
          navigate('/planes');
          break;
      }
    }

    handleRedirect();
  }, []);

  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="loader"></div>
    </div>
  )
}

export default Redirect;