import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase/client';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
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
import GeneralInfo from './components/GeneralInfo';
import LoginAdmin from './admin/Login';
import AdminPanel from './admin/AdminPanel';


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(false);
  const [event, setEvent] = useState("SIGNED_OUT");
  const [profile, setProfile] = useState({
    avatar: null,
    name: null,
    phone: null,
  });

  // Detecta preferencia de color del sistema
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  // Cambia el tema dependiendo del estado darkMode
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  // Alterna entre temas
  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    setTimeout(() => {
      supabase.auth.onAuthStateChange((event, session) => {
        setEvent(event)
        if (!session && location.pathname !== '/admin') {
          navigate('/login');
        } else if (event === "SIGNED_IN ") {
          navigate('/panel');
        } else if (session && event === "INITIAL_SESSION") {
          const userUUID = session?.user?.id;
          setUserId(userUUID);
          navigate('/general_info')

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
            {event !== "SIGNED_OUT" && <Navbar profile={profile} mode={darkMode} toggleTheme={toggleTheme} />}
            <Routes>
              <Route path='/panel' element={<Dashboard />} />
              <Route path='/login' element={<Login mode={darkMode} toggleTheme={toggleTheme} />} />
              <Route path='/clientes' element={<MembersList />} />
              <Route path='/entrenadores' element={<Trainers />} />
              <Route path='/general_info' element={<GeneralInfo id={userId} />} />
              <Route path='/new_member' element={<MembersForm />} />
              <Route path='/new_trainer' element={<TrainersForm />} />
              <Route path='/admin' element={<LoginAdmin />} />
              <Route path='/admin/panel' element={<AdminPanel />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BackdropProvider>
        </ContextProvider>
      </div>
    </ThemeProvider >
  )
}

export default App;
