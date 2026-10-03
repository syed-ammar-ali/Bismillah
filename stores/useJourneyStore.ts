import { create } from 'zustand';
import { DayLog, Journey, Task, TaskCompletion } from '../core/types';

interface JourneyState {
  journeys: Journey[];
  tasks: Record<string, Task[]>;
  completions: Record<string, TaskCompletion[]>;
  dayLogs: Record<string, DayLog[]>;
  milestonesSeen: Record<string, number[]>;

  setAll: (data: {
    journeys: Journey[];
    tasks: Record<string, Task[]>;
    completions: Record<string, TaskCompletion[]>;
    dayLogs: Record<string, DayLog[]>;
    milestonesSeen: Record<string, number[]>;
  }) => void;

  setJourneys: (journeys: Journey[]) => void;
  setTasks: (journeyId: string, tasks: Task[]) => void;
  addCompletion: (completion: TaskCompletion) => void;
  removeCompletion: (taskId: string, dayNumber: number) => void;
  setDayLog: (journeyId: string, dayNumber: number, gapReason: string | null) => void;
  markMilestoneSeen: (journeyId: string, dayNumber: number) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  journeys: [],
  tasks: {},
  completions: {},
  dayLogs: {},
  milestonesSeen: {},

  setAll: (data) => set(data),

  setJourneys: (journeys) => set({ journeys }),

  setTasks: (journeyId, tasks) =>
    set((state) => ({
      tasks: { ...state.tasks, [journeyId]: tasks },
    })),

  addCompletion: (completion) =>
    set((state) => {
      const list = state.completions[completion.journeyId] ?? [];
      const filtered = list.filter(
        (c) => !(c.taskId === completion.taskId && c.dayNumber === completion.dayNumber),
      );
      return {
        completions: {
          ...state.completions,
          [completion.journeyId]: [...filtered, completion],
        },
      };
    }),

  removeCompletion: (taskId, dayNumber) =>
    set((state) => {
      const updatedCompletions: Record<string, TaskCompletion[]> = {};
      for (const [jId, list] of Object.entries(state.completions)) {
        updatedCompletions[jId] = list.filter(
          (c) => !(c.taskId === taskId && c.dayNumber === dayNumber),
        );
      }
      return { completions: updatedCompletions };
    }),

  setDayLog: (journeyId, dayNumber, gapReason) =>
    set((state) => {
      const list = state.dayLogs[journeyId] ?? [];
      const filtered = list.filter((l) => l.dayNumber !== dayNumber);
      if (!gapReason) {
        return {
          dayLogs: { ...state.dayLogs, [journeyId]: filtered },
        };
      }
      const newLog: DayLog = {
        id: `gap-${journeyId}-${dayNumber}`,
        journeyId,
        dayNumber,
        gapReason,
        updatedAt: new Date().toISOString(),
      };
      return {
        dayLogs: { ...state.dayLogs, [journeyId]: [...filtered, newLog] },
      };
    }),

  markMilestoneSeen: (journeyId, dayNumber) =>
    set((state) => {
      const current = state.milestonesSeen[journeyId] ?? [];
      if (current.includes(dayNumber)) return state;
      return {
        milestonesSeen: {
          ...state.milestonesSeen,
          [journeyId]: [...current, dayNumber],
        },
      };
    }),
}));
