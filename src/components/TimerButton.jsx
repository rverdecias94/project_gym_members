import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

// eslint-disable-next-line react/prop-types
const TimerButton = ({ setReload }) => {
  const [timeLeft, setTimeLeft] = useState(20); // 10 minutos en segundos
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Button
      color="primary"
      variant="contained"
      style={{ width: "100%", marginTop: 20 }}
      disabled={isDisabled}
      onClick={setReload}
    >
      {isDisabled ? `Verificar estado de solicitud (${formatTime(timeLeft)})` : "Verificar estado de solicitud"}
    </Button>
  );
};

export default TimerButton;
