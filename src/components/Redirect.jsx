import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

const Redirect = () => {

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      if (user) {
        const { data } = await supabase
          .from('info_general_gym')
          .select('store')
          .eq('owner_id', user.id)
          .single();

        if (data === null) {
          navigate('/planes');
        } else {
          navigate('/general_info');
        }
      } else {
        navigate('/login');
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