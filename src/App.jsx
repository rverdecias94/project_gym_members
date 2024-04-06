import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import { Container } from '@mui/material';
import NotFound from './components/NotFound';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import Navbar from './components/Navbar';
import { ContextProvider } from './context/Context';
import Menu from './components/Menu';
import MembersForm from './components/MembersForm';
import TrainersForm from './components/TrainersForm';


function App() {
  const [sessionActive, setsessionActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
        setsessionActive(false);
      } else {
        navigate('/')
        setsessionActive(true);
      }
    })
  }, [])


  return (
    <Container sx={{ width: "100vw", height: "100vh", padding: "0px !important", }}>
      <ContextProvider>
        {sessionActive ? <Navbar /> : null}
        <Routes>
          <Route path='/' element={<Menu />} />
          <Route path='/login' element={<Login />} />
          <Route path='/new_member' element={<MembersForm />} />
          <Route path='/new_trainer' element={<TrainersForm />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ContextProvider>
    </Container>
  )
}

export default App
