import { create } from 'zustand';
import { CelebrationItem } from '../core/types';

interface UiState {
  celebrationQueue: CelebrationItem[];
  activeCelebration: CelebrationItem | null;
  enqueueCelebration: (item: CelebrationItem) => void;
  enqueueCelebrations: (items: CelebrationItem[]) => void;
  dismissActiveCelebration: () => void;
  clearCelebrations: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  celebrationQueue: [],
  activeCelebration: null,

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
}));
