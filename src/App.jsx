import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase/client';
import Login from './components/Login';
import NotFound from './components/NotFound';
import Navbar from './components/Navbar';
import { ContextProvider } from './context/Context';
import MembersForm from './components/MembersForm';
import TrainersForm from './components/TrainersForm';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import Trainers from './components/TrainersList';
import { BackdropProvider } from './components/BackdropProvider';
/* import GeneralInfo from './components/GeneralInfo'; */
/* import LoginAdmin from './admin/Login'; */
import AdminPanel from './admin/AdminPanel';
import Welcome from './components/Welcome';
import TermsAndConditions from './components/TermsAndConditions';
import StoreManagment from './components/StoreManagment';
import PlansPage from './components/Plans';
import Redirect from './components/Redirect';
import GymStepper from './components/GymStepper';
import ShopStepper from './components/ShopStepper';
import SessionManager from './components/SessionManager';
import StoreManagmentGym from './components/StoreManagmentGym';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner"


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(false);
  const [is404, setIs404] = useState(false);
  const [event, setEvent] = useState("SIGNED_OUT");
  const [profile, setProfile] = useState({
    avatar: null,
    name: null,
    phone: null,
  });
  const [darkMode, setDarkMode] = useState(false);
  const validPath = ['/shop-stepper', '/redirect', '/planes', '/tienda', '/tienda-gym', '/terms-conditions', '/admin/panel', '/new_trainer', '/new_member', '/general_info', '/entrenadores', '/bienvenido', '/clientes', '/login', '/panel']

  useEffect(() => {
    const fetchTheme = async (userId) => {
      const { data } = await supabase
        .from("info_general_gym")
        .select("theme")
        .eq("owner_id", userId)
        .single();

      if (data) {
        setDarkMode(data.theme);
      }
    };
    fetchTheme(userId);
  }, [userId]);

  // Alterna entre temas
  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);

    // Aplicar clase dark a html para Tailwind
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    await supabase
      .from("info_general_gym")
      .update({ theme: newTheme })
      .eq("owner_id", userId);
  };

  useEffect(() => {
    // Aplicar clase dark al montar si es necesario
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setEvent(event);

      if (session) {
        const userUUID = session.user.id;
        setUserId(userUUID);

        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_IN ") {
          // Si el usuario está en login y se autentica, redirigir a /redirect para que el componente decida dónde ir
          if (location.pathname === '/login' || location.pathname === '/') {
            navigate('/redirect');
          }

          if (event === "INITIAL_SESSION") {
            /* navigate('/general_info') */
            // navigate('/redirect') // Comentado para evitar redirecciones forzadas al recargar

            if (session.user.user_metadata) {
              let { avatar_url, name, phone, email } = session.user.user_metadata;
              setProfile((prev) => ({
                ...prev,
                name: name,
                avatar: avatar_url,
                phone: phone,
                id: session.user.id,
                email: email,
              }));
            }
          }
        }
      } else {
        setUserId(false);
        setProfile({ avatar: null, name: null, phone: null });
        // No redirigimos manualmente aquí, ProtectedRoute se encarga
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);


  useEffect(() => {
    if (!validPath.includes(location.pathname))
      setIs404(true);
    else
      setIs404(false);
  }, [location.pathname])


  return (
    <div style={{ width: "100%", height: "100vh", padding: "0px !important" }}>
      <ContextProvider>
        <BackdropProvider>
          {event && window.location.pathname !== '/login' && window.location.pathname !== '/terms-conditions' && !is404 && <Navbar profile={profile} mode={darkMode} toggleTheme={toggleTheme} />}
          {userId && <SessionManager />}
          <div className='main-content'>
            <Routes>
              {/* Rutas Públicas */}
              <Route path='/login' element={<Login id={userId} />} />
              <Route path='/terms-conditions' element={<TermsAndConditions />} />
              <Route path='/redirect' element={<Redirect />} />

              {/* Rutas Protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path='/panel' element={<Dashboard />} />
                <Route path='/clientes' element={<MembersList />} />
                <Route path='/bienvenido' element={<Welcome />} />
                <Route path='/entrenadores' element={<Trainers />} />
                <Route path='/general_info' element={<GymStepper id={userId} />} />
                <Route path='/new_member' element={<MembersForm />} />
                <Route path='/new_trainer' element={<TrainersForm />} />
                <Route path='/admin/panel' element={<AdminPanel />} />
                <Route path='/tienda-gym' element={<StoreManagmentGym />} />
                <Route path='/tienda' element={<StoreManagment />} />
                <Route path='/planes' element={<PlansPage />} />
                <Route path='/shop-stepper' element={<ShopStepper id={userId} />} />
              </Route>

              <Route path='*' element={<NotFound />} />
            </Routes>
          </div>
          <Toaster position="bottom-right" theme={darkMode ? 'dark' : 'light'} richColors />
        </BackdropProvider>
      </ContextProvider>
    </div>
  )
}

export default App;