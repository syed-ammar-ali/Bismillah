export type Result<T = void, E = string> =
  | { ok: true; value: T }
  | { ok: false; reason: E };

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export interface ScheduleDailySpec {
  hour: number;
  minute: number;
  title: string;
  body: string;
}

export interface ScheduleOnceSpec {
  triggerSeconds: number;
  title: string;
  body: string;
}

export type CalendarType = 'hijri' | 'gregorian';
export type TaskKind = 'daily' | 'makeup';
export type DayStatus = 'future' | 'today' | 'sealed' | 'gap' | 'madeUp';
export type GlowLevel = 0 | 1 | 2 | 3 | 4;

export interface Journey {
  id: string;
  name: string;
  calendarType: CalendarType;
  startInput: string;
  endInput: string;
  startDate: string; // resolved Gregorian YYYY-MM-DD
  endDate: string; // resolved Gregorian YYYY-MM-DD
  totalDays: number;
  deadlineLabel?: string | null;
  deadlineDate?: string | null;
  closingNote?: string | null;
  completionShownAt?: string | null;
  sortOrder: number;
  createdAt: string;
  archivedAt?: string | null;
}

export interface Task {
  id: string;
  journeyId: string;
  title: string;
  note?: string | null;
  kind: TaskKind;
  sortOrder: number;
  activeFromDay: number;
  activeToDay?: number | null;
}

export interface TaskCompletion {
  id: string;
  journeyId: string;
  taskId: string;
  dayNumber: number;
  completedAt: string;
}

export interface DayLog {
  id: string;
  journeyId: string;
  dayNumber: number;
  gapReason?: string | null;
  updatedAt: string;
}

export interface MilestoneSeen {
  journeyId: string;
  dayNumber: number;
  shownAt: string;
}

export interface AppSettings {
  hijriAdjustment: -1 | 0 | 1;
  reminderTime: string;
  reminderEnabled: boolean;
  eveningNudgeEnabled: boolean;
  eveningNudgeTime: string;
  onboardingDone: boolean;
  batteryChecklistDone: boolean;
  lastBackupAt?: string | null;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  glowLevel: GlowLevel;
}

export interface ProgressInfo {
  totalDays: number;
  sealedDays: number;
  gapDays: number;
  madeUpDays: number;
  progressFraction: number;
  progressPercent: number;
}

export interface TaskWithCompletion extends Task {
  isCompleted: boolean;
}

export type CelebrationType = 'seal' | 'milestone' | 'completion';

export interface CelebrationItem {
  id: string;
  type: CelebrationType;
  journeyId: string;
  dayNumber?: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'widget' | 'notification' | 'system' | 'general';
  message: string;
}
