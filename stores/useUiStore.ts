import { create } from 'zustand';
import { CelebrationItem } from '../core/types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface UiState {
  celebrationQueue: CelebrationItem[];
  activeCelebration: CelebrationItem | null;
  activeToast: ToastMessage | null;
  enqueueCelebration: (item: CelebrationItem) => void;
  enqueueCelebrations: (items: CelebrationItem[]) => void;
  dismissActiveCelebration: () => void;
  clearCelebrations: () => void;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  dismissToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  celebrationQueue: [],
  activeCelebration: null,
  activeToast: null,

  enqueueCelebration: (item) =>
    set((state) => {
      if (!state.activeCelebration) {
        return { activeCelebration: item };
      }
      return { celebrationQueue: [...state.celebrationQueue, item] };
    }),

  enqueueCelebrations: (items) =>
    set((state) => {
      if (items.length === 0) return state;
      const [first, ...rest] = items;
      if (!first) return state;

      if (!state.activeCelebration) {
        return {
          activeCelebration: first,
          celebrationQueue: [...state.celebrationQueue, ...rest],
        };
      }
      return {
        celebrationQueue: [...state.celebrationQueue, ...items],
      };
    }),

  dismissActiveCelebration: () =>
    set((state) => {
      const next = state.celebrationQueue[0] ?? null;
      const remaining = state.celebrationQueue.slice(1);
      return {
        activeCelebration: next,
        celebrationQueue: remaining,
      };
    }),

  clearCelebrations: () =>
    set({
      celebrationQueue: [],
      activeCelebration: null,
    }),

  showToast: (message, type = 'info') =>
    set({
      activeToast: {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
      },
    }),

  dismissToast: () =>
    set({
      activeToast: null,
    }),
}));
