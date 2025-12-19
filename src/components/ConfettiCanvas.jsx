import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const ConfettiCanvas = ({ onInit }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && onInit) {
      const confettiInstance = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
      onInit(confettiInstance);

      // Cleanup
      return () => {
        // confetti.reset() might be an option if we want to clear all canvases
        // but since we control this one, we can just let it be.
        // The instance doesn't have a destroy method.
      };
    }
  }, [onInit]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default ConfettiCanvas;
