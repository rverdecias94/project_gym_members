import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './components/Theme';  // Importa los temas
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
import LoginAdmin from './admin/Login';
import AdminPanel from './admin/AdminPanel';
import Welcome from './components/Welcome';
import TermsAndConditions from './components/TermsAndConditions';
import StoreManagment from './components/StoreManagment';
import PlansPage from './components/Plans';
import Redirect from './components/Redirect';
import GymStepper from './components/GymStepper';


function App() {
  const navigate = useNavigate();
  /* const location = useLocation(); */
  const [userId, setUserId] = useState(false);
  const [event, setEvent] = useState("SIGNED_OUT");
  const [profile, setProfile] = useState({
    avatar: null,
    name: null,
    phone: null,
  });
  const [darkMode, setDarkMode] = useState(false);

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

  // Cambia el tema dependiendo del estado darkMode
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  // Alterna entre temas
  const toggleTheme = async () => {
    setDarkMode((prevMode) => !prevMode);
    await supabase
      .from("info_general_gym")
      .update({ theme: !darkMode })
      .eq("owner_id", userId);
  };

  useEffect(() => {
    setTimeout(() => {
      supabase.auth.onAuthStateChange((event, session) => {
        setEvent(event)
        if (!session && window.location.pathname !== '/admin' && window.location.pathname !== '/terms-conditions' && window.location.pathname !== '/admin/panel') {
          const userUUID = session?.user?.id;
          setUserId(userUUID);
          navigate('/login');
        } else if (event === "SIGNED_IN ") {
          navigate('/panel');
        } else if (session && event === "INITIAL_SESSION") {
          const userUUID = session?.user?.id;
          setUserId(userUUID);
          /* navigate('/general_info') */
          navigate('/redirect')

          if (session?.user?.user_metadata) {
            let { avatar_url, name, phone } = session.user.user_metadata;
            setProfile((prev) => ({
              ...prev,
              name: name,
              avatar: avatar_url,
              phone: phone,
              id: session.user.id
            }))
          }
        }
      })
    }, 0);
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: "100%", height: "100vh", padding: "0px !important" }}>
        <ContextProvider>
          <BackdropProvider>
            {event && window.location.pathname !== '/login' && window.location.pathname !== '/terms-conditions' && <Navbar profile={profile} mode={darkMode} toggleTheme={toggleTheme} />}
            <Routes>
              <Route path='/panel' element={<Dashboard />} />
              <Route path='/login' element={<Login id={userId} />} />
              <Route path='/clientes' element={<MembersList />} />
              <Route path='/bienvenido' element={<Welcome />} />
              <Route path='/entrenadores' element={<Trainers />} />
              <Route path='/general_info' element={<GymStepper id={userId} />} />
              <Route path='/new_member' element={<MembersForm />} />
              <Route path='/new_trainer' element={<TrainersForm />} />
              <Route path='/admin' element={<LoginAdmin />} />
              <Route path='/admin/panel' element={<AdminPanel />} />
              <Route path='/terms-conditions' element={<TermsAndConditions />} />
              <Route path='/tienda' element={<StoreManagment />} />
              <Route path='/planes' element={<PlansPage />} />
              <Route path='/redirect' element={<Redirect />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BackdropProvider>
        </ContextProvider>
      </div>
    </ThemeProvider >
  )
}

export default App;