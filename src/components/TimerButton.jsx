import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { supabase } from "../supabase/client";

const TIMER = {
  minutes: 600,
  seconds: 15,
}

// eslint-disable-next-line react/prop-types
const TimerButton = ({ setReload, timer }) => {
  const [timeLeft, setTimeLeft] = useState(TIMER[timer]); // 10 minutos en segundos
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsDisabled(false);
    }
  }, [timeLeft]);


  useEffect(() => {
    if (timer === "seconds") {
      const logoutUser = async () => {
        await supabase.auth.signOut();
      }

      setInterval(() => {
        logoutUser();
      }, 15000); // 15 segundos para cerrar sesión automáticamente
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {
        timer === "minutes" ?
          <Button
            color="primary"
            variant="contained"
            style={{ width: "100%", marginTop: 20 }}
            disabled={isDisabled}
            onClick={setReload}
          >
            {isDisabled ? `Verificar estado de solicitud (${formatTime(timeLeft)})` : "Verificar estado de solicitud"}
          </Button>
          :
          <Button
            color="primary"
            variant="contained"
            style={{ width: "100%", marginTop: 20 }}
            disabled={isDisabled}
            onClick={setReload}
          >
            {isDisabled && `Regresar al inicio en (${formatTime(timeLeft)})`}
          </Button>
      }
    </div>
  );
};

export default TimerButton;
