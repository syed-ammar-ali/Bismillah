import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../core/constants';
import { getToday } from '../core/dates';
import { AppSettings } from '../core/types';

interface AppState {
  today: string;
  settings: AppSettings;
  hydrated: boolean;
  setToday: (today: string) => void;
  setSettings: (settings: AppSettings) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  today: getToday(),
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,
  setToday: (today) => set({ today }),
  setSettings: (settings) => set({ settings }),
  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),
  setHydrated: (hydrated) => set({ hydrated }),
}));
