import { create } from 'zustand';

interface TimerState {
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  updateElapsedTime: (time: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  startTime: null,
  elapsedTime: 0,
  isRunning: false,
  startTimer: () => set((state) => {
    if (!state.isRunning) {
      return {
        startTime: Date.now() - state.elapsedTime,
        isRunning: true
      };
    }
    return state;
  }),
  stopTimer: () => set((state) => {
    if (state.isRunning) {
      return {
        isRunning: false,
        elapsedTime: Date.now() - (state.startTime || Date.now())
      };
    }
    return state;
  }),
  resetTimer: () => set({
    startTime: null,
    elapsedTime: 0,
    isRunning: false
  }),
  updateElapsedTime: (time: number) => set({ elapsedTime: time })
})); 