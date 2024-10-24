import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import NotFound from './components/NotFound';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import Navbar from './components/Navbar';
import { ContextProvider } from './context/Context';
import MembersForm from './components/MembersForm';
import TrainersForm from './components/TrainersForm';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import Trainers from './components/TrainersList';
import { BackdropProvider } from './components/BackdropProvider';


function App() {
  const [sessionActive, setsessionActive] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    avatar: null,
    name: null,
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
        setsessionActive(false);
      } else if (event === "INITIAL_SESSION") {
        navigate('/panel')
        if (session?.user?.user_metadata) {
          let { avatar_url, name } = session.user.user_metadata;
          setProfile((prev) => ({
            ...prev,
            name: name,
            avatar: avatar_url
          }))
        }
        setsessionActive(true);
      }
    })
  }, [])


  return (
    <div style={{ width: "100%", height: "100vh", padding: "0px !important", }}>
      <ContextProvider>
        <BackdropProvider>
          {sessionActive ? <Navbar profile={profile} /> : null}
          <Routes>
            <Route path='/panel' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/clientes' element={<MembersList />} />
            <Route path='/entrenadores' element={<Trainers />} />
            <Route path='/new_member' element={<MembersForm />} />
            <Route path='/new_trainer' element={<TrainersForm />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BackdropProvider>
      </ContextProvider>
    </div>
  )
}

export default App
