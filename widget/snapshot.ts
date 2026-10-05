import { toHijri } from '../core/hijri';
import {
  ClockPort,
  CompletionRepo,
  JourneyRepo,
  SettingsRepo,
  TaskRepo,
} from '../core/ports';
import { todayTasks } from '../core/progress';
import { dayStatus } from '../core/status';
import { computeStreakInfo } from '../core/streak';
import { dayNumberFor } from '../core/timeline';
import { DayStatus } from '../core/types';

interface KvStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

function getKvStorage(): KvStorage | null {
  try {
    // Lazy require so node/jest test environments without native modules don't evaluate expo-sqlite/kv-store
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-sqlite/kv-store').default as KvStorage;
  } catch {
    return null;
  }
}

export interface WidgetPendingTask {
  id: string;
  title: string;
}

export interface WidgetJourneySummary {
  id: string;
  name: string;
  dayNumber: number;
  totalDays: number;
  streak: number;
  glow: number;
  done: number;
  total: number;
  pendingTasks: WidgetPendingTask[];
}

export interface WidgetSnapshot {
  date: string;
  journeys: WidgetJourneySummary[];
  hijriLabel: string;
}

export const WIDGET_SNAPSHOT_KEY = 'widget_snapshot';

export async function getWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  try {
    const storage = getKvStorage();
    if (!storage) {
      return null;
    }
    const raw = await storage.getItem(WIDGET_SNAPSHOT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as WidgetSnapshot;
  } catch {
    return null;
  }
}

export async function setWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  try {
    const storage = getKvStorage();
    if (storage) {
      await storage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot));
    }
  } catch {
    // kv-store fallback
  }
}

export interface BuildWidgetSnapshotDeps {
  journeyRepo: JourneyRepo;
  taskRepo: TaskRepo;
  completionRepo: CompletionRepo;
  settingsRepo: SettingsRepo;
  clock: ClockPort;
}

export async function buildWidgetSnapshot(
  deps: BuildWidgetSnapshotDeps,
): Promise<WidgetSnapshot> {
  const today = deps.clock.today();
  const settings = await deps.settingsRepo.getAll();
  const allJourneys = await deps.journeyRepo.getAll();

  const journeySummaries: WidgetJourneySummary[] = [];

  for (const journey of allJourneys) {
    const dayNumber = dayNumberFor(journey, today);
    if (dayNumber === null) {
      continue;
    }

    const tasks = await deps.taskRepo.getByJourney(journey.id);
    const completions = await deps.completionRepo.getByJourney(journey.id);

    // Compute day statuses up to dayNumber for streak
    const dayStatuses: Record<number, DayStatus> = {};
    for (let d = 1; d <= dayNumber; d++) {
      dayStatuses[d] = dayStatus(journey, d, today, tasks, completions);
    }

    const streakInfo = computeStreakInfo(dayStatuses, dayNumber, journey.totalDays);
    const todayTaskList = todayTasks(dayNumber, tasks, completions);

    const done = todayTaskList.filter((t) => t.isCompleted).length;
    const total = todayTaskList.length;
    const pendingTasks = todayTaskList
      .filter((t) => !t.isCompleted)
      .map((t) => ({ id: t.id, title: t.title }));

    journeySummaries.push({
      id: journey.id,
      name: journey.name,
      dayNumber,
      totalDays: journey.totalDays,
      streak: streakInfo.currentStreak,
      glow: streakInfo.glowLevel,
      done,
      total,
      pendingTasks,
    });
  }

  const hijri = toHijri(today, settings.hijriAdjustment);
  const hijriLabel = `${hijri.day} ${hijri.monthName}`;

  return {
    date: today,
    journeys: journeySummaries,
    hijriLabel,
  };
}

// Compatibility helpers for dev spike screen
const COUNTER_KEY = 'spike_counter';

export async function getStoredCount(): Promise<number> {
  try {
    const storage = getKvStorage();
    if (!storage) return 0;
    const val = await storage.getItem(COUNTER_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function incrementStoredCount(): Promise<number> {
  const current = await getStoredCount();
  const next = current + 1;
  try {
    const storage = getKvStorage();
    if (storage) {
      await storage.setItem(COUNTER_KEY, String(next));
    }
  } catch {
    // fallback
  }
  return next;
}
