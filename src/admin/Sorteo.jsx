/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { supabase } from '../supabase/client';
import ConfettiCanvas from '../components/ConfettiCanvas';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components
const SorteoWrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  minHeight: '100vh',
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1000,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const Header = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

const Stat = styled(Box)(({ theme }) => ({
  background: theme.palette.action.hover,
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.secondary.main,
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  margin: theme.spacing(4, 0),
  flexWrap: 'wrap',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 4),
}));

const StarsArea = styled(Box)(({ theme }) => ({
  height: 200,
  background: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const StagePaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  minWidth: '280px',
  border: `1px solid ${theme.palette.divider}`,
}));

const ParticipantsContainer = styled(Box)({
  maxHeight: 300,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
});

const ParticipantItem = styled(Box)(({ theme, selected, winner }) => ({
  background: selected ? theme.palette.action.selected : theme.palette.action.hover,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  borderLeft: selected ? `4px solid ${theme.palette.secondary.main}` : 'none',
  transition: 'all 0.3s ease',
  ...(winner && {
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  }),
}));

const WinnerAnnouncement = styled(Box)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  padding: theme.spacing(3),
  fontSize: '2rem',
  textAlign: 'center',
  border: `2px solid ${theme.palette.secondary.main}`,
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
}));

const SoundControl = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  background: theme.palette.background.paper,
  width: 50,
  height: 50,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`,
  zIndex: 1001,
}));

export default function SorteoFitness({ raffle, onBack }) {
  const theme = useTheme();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [winner, setWinner] = useState(null);
  const [firstStageDone, setFirstStageDone] = useState(false);
  const [phaseText, setPhaseText] = useState("Preparados para el reto");
  const [starsCount, setStarsCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const starsRef = useRef(null);
  const audioCtx = useRef(null);
  const confettiInstance = useRef(null);

  useEffect(() => {
    if (raffle) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      fetchParticipants();
    }
  }, [raffle]);

  const handleConfettiInit = (instance) => {
    confettiInstance.current = instance;
  };

  const fetchParticipants = async () => {
    if (!raffle) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('raffle_participants').select('*').eq('id_raffles', raffle.id);
      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  const playTone = (freq, duration = 0.3) => {
    if (!soundEnabled || !audioCtx.current) return;
    try {
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const createStars = (count) => {
    if (!starsRef.current) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!starsRef.current) return;
        const star = document.createElement("div");
        star.style.position = 'absolute';
        star.style.width = '25px';
        star.style.height = '25px';
        star.style.opacity = '0';
        star.style.transition = 'all 0.5s ease';
        star.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        star.style.background = Math.random() > 0.5 ? theme.palette.accent.main : `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`;
        star.style.left = `${Math.random() * 85 + 5}%`;
        star.style.top = `${Math.random() * 85 + 5}%`;
        starsRef.current.appendChild(star);
        setStarsCount(c => c + 1);
        playTone(1200, 0.25);
        requestAnimationFrame(() => (star.style.opacity = "1"));
        setTimeout(() => (star.style.opacity = "0"), 700);
        setTimeout(() => star.remove(), 1100);
      }, i * 100);
    }
  };

  const startFirstStage = () => {
    if (firstStageDone || participants.length === 0) return;
    playTone(800, 0.2);
    setPhaseText("¡Seleccionando clasificados!");

    const validParticipants = participants.filter(p => p);
    const countToSelect = Math.max(1, Math.floor(validParticipants.length / 2));
    const shuffled = [...validParticipants].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, countToSelect);

    let i = 0;
    const interval = setInterval(() => {
      if (i >= chosen.length) {
        clearInterval(interval);
        setFirstStageDone(true);
        setPhaseText("¡Primera fase completada!");
        return;
      }
      const nextItem = chosen[i];
      if (nextItem) {
        setSelected(prev => [...prev, nextItem]);
        createStars(3);
      }
      i++;
    }, chosen.length > 50 ? 20 : 100);
  };

  const startFinalStage = async () => {
    if (!firstStageDone || selected.length === 0) return;
    setPhaseText("¡Gran final!");

    let count = 0;
    const interval = setInterval(async () => {
      createStars(2);
      count++;
      if (count > 25) {
        clearInterval(interval);
        const win = selected[Math.floor(Math.random() * selected.length)];
        if (win) {
          setWinner(win);
          setPhaseText("¡Tenemos un ganador!");
          playTone(523, 0.6);
          if (confettiInstance.current) {
            confettiInstance.current({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
          }
          try {
            await supabase.from('raffles_tronoss').update({ state_lottery: '2', uid_user_winner: win.uid_user_participating }).eq('id', raffle.id);
          } catch (error) {
            console.error("Error updating winner", error);
          }
        }
      }
    }, 150);
  };

  const reset = () => {
    setSelected([]);
    setWinner(null);
    setFirstStageDone(false);
    setStarsCount(0);
    setPhaseText("Preparados para el reto");
    playTone(800, 0.2);
  };

  const getDisplayName = (p) => p ? (p.name || p.full_name || p.username || `ID: ${p.id || '?'}`) : "N/A";

  if (!raffle) return <SorteoWrapper><Typography>Error: No se seleccionó ningún sorteo.</Typography></SorteoWrapper>;
  if (loading) return <SorteoWrapper><Typography>Cargando participantes...</Typography></SorteoWrapper>;

  return (
    <SorteoWrapper>
      <ConfettiCanvas onInit={handleConfettiInit} />
      <Box sx={{ maxWidth: 1200, margin: 'auto', position: 'relative' }}>
        <Button onClick={onBack} startIcon={<i className="fa-solid fa-arrow-left"></i>} sx={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>Volver</Button>
        <Header>
          <Typography variant="h3" component="h1" gutterBottom>⭐ {raffle.name_lottery} ⭐</Typography>
          <Typography variant="h5" color="textSecondary">{raffle.prize_lottery}</Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Grid item><Stat><StatValue>{participants.length}</StatValue><Typography>Participantes</Typography></Stat></Grid>
            <Grid item><Stat><StatValue>{selected.length}</StatValue><Typography>Clasificados</Typography></Stat></Grid>
            <Grid item><Stat><StatValue>{starsCount}</StatValue><Typography>Estrellas</Typography></Stat></Grid>
          </Grid>
        </Header>

        <Controls>
          <ActionButton variant="contained" color="primary" onClick={startFirstStage} disabled={firstStageDone || participants.length === 0}>
            {participants.length === 0 ? "Sin Participantes" : "Iniciar Primera Fase"}
          </ActionButton>
          <ActionButton variant="contained" color="secondary" onClick={startFinalStage} disabled={!firstStageDone || winner}>Gran Final</ActionButton>
          <ActionButton variant="outlined" onClick={reset} disabled={!winner}>Reiniciar</ActionButton>
        </Controls>

        <Typography variant="h5" align="center" sx={{ mb: 3 }}>{phaseText}</Typography>
        {!winner && <StarsArea ref={starsRef} />}

        {winner && (
          <WinnerAnnouncement>
            🏆 {getDisplayName(winner)} 🏆
            <Typography variant="body2" sx={{ mt: 1 }}>ID: {winner.uid_user_participating?.substring(0, 8)}...</Typography>
          </WinnerAnnouncement>
        )}

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}><StageComponent title="Participantes" items={participants} highlight={selected} getDisplayName={getDisplayName} /></Grid>
          <Grid item xs={12} md={4}><StageComponent title="Clasificados" items={selected} getDisplayName={getDisplayName} /></Grid>
          <Grid item xs={12} md={4}><StageComponent title="Ganador" items={winner ? [winner] : []} winner getDisplayName={getDisplayName} /></Grid>
        </Grid>

        <SoundControl onClick={() => setSoundEnabled(s => !s)}>
          {soundEnabled ? <i className="fa-solid fa-volume-up"></i> : <i className="fa-solid fa-volume-mute"></i>}
        </SoundControl>
      </Box>
    </SorteoWrapper>
  );
}

function StageComponent({ title, items, highlight = [], winner, getDisplayName }) {
  const highlightIds = new Set(highlight.map(h => h?.id));
  return (
    <StagePaper>
      <Typography variant="h6" component="h2" align="center" gutterBottom>{title}</Typography>
      <ParticipantsContainer>
        {items.map((p, idx) => (
          <ParticipantItem key={p?.id || idx} selected={p?.id && highlightIds.has(p.id)} winner={winner}>
            {getDisplayName(p)}
          </ParticipantItem>
        ))}
      </ParticipantsContainer>
    </StagePaper>
  );
}
