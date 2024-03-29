import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import { Container } from '@mui/material';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import Navbar from './components/Navbar';

function App() {
  const [sessionActive, setsessionActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)
      if (!session) {
        navigate('/login');
        setsessionActive(false);
      } else {
        navigate('/')
        setsessionActive(true);
      }
    })
  }, [navigate])


  return (
    <Container sx={{ width: "100vw", height: "100vh", paddingLeft: "0px !important", }}>
      {sessionActive ? <Navbar /> : null}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Container>
  )
}

export default App
