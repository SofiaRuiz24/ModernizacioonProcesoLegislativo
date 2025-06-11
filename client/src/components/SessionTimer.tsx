import { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { Clock } from 'lucide-react';

export function SessionTimer() {
  const { startTime, elapsedTime, isRunning, startTimer, updateElapsedTime } = useTimerStore();

  useEffect(() => {
    // Iniciar el timer si hay una sesión activa
    if (!isRunning && startTime === null) {
      startTimer();
    }

    // Actualizar el tiempo cada segundo
    const interval = setInterval(() => {
      if (isRunning) {
        const currentTime = Date.now();
        const newElapsedTime = currentTime - (startTime || currentTime);
        updateElapsedTime(newElapsedTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime, startTimer, updateElapsedTime]);

  // Formatear el tiempo en HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <span className="font-mono text-lg font-medium text-blue-700 dark:text-blue-300">
        {formatTime(elapsedTime)}
      </span>
    </div>
  );
} 