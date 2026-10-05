import {
  AppSettings,
  DayLog,
  Journey,
  MilestoneSeen,
  PermissionState,
  ScheduleDailySpec,
  ScheduleOnceSpec,
  Task,
  TaskCompletion,
} from './types';

// Repositories
export interface JourneyRepo {
  getAll(): Promise<Journey[]>;
  getAllIncludingArchived(): Promise<Journey[]>;
  getById(id: string): Promise<Journey | null>;
  create(journey: Journey): Promise<void>;
  update(journey: Partial<Journey> & { id: string }): Promise<void>;
  archive(id: string, archivedAt: string): Promise<void>;
  delete(id: string): Promise<void>;
  replaceAll(journeys: Journey[]): Promise<void>;
}

export interface TaskRepo {
  getByJourney(journeyId: string): Promise<Task[]>;
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  createMany(tasks: Task[]): Promise<void>;
  update(task: Partial<Task> & { id: string }): Promise<void>;
  delete(id: string): Promise<void>;
  replaceAll(tasks: Task[]): Promise<void>;
}

export interface CompletionRepo {
  getByJourney(journeyId: string): Promise<TaskCompletion[]>;
  getByDay(journeyId: string, dayNumber: number): Promise<TaskCompletion[]>;
  getAll(): Promise<TaskCompletion[]>;
  add(completion: TaskCompletion): Promise<void>;
  remove(taskId: string, dayNumber: number): Promise<void>;
  removeByJourneyAndDay(journeyId: string, dayNumber: number): Promise<void>;
  replaceAll(completions: TaskCompletion[]): Promise<void>;
}

export interface GapNoteRepo {
  getNote(journeyId: string, dayNumber: number): Promise<string | null>;
  getByJourney(journeyId: string): Promise<DayLog[]>;
  getAll(): Promise<DayLog[]>;
  setNote(journeyId: string, dayNumber: number, gapReason: string | null): Promise<void>;
  replaceAll(logs: DayLog[]): Promise<void>;
}

export interface MilestoneRepo {
  getSeen(journeyId: string): Promise<number[]>;
  getAll(): Promise<MilestoneSeen[]>;
  markSeen(journeyId: string, dayNumber: number, shownAt: string): Promise<void>;
  replaceAll(milestones: MilestoneSeen[]): Promise<void>;
}

export interface SettingsRepo {
  get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>;
  getAll(): Promise<AppSettings>;
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>;
  setMany(settings: Partial<AppSettings>): Promise<void>;
  replaceAll(settings: AppSettings): Promise<void>;
}

export interface BackupRepo {
  exportAll(): Promise<import('./backup').BackupData>;
  replaceAll(data: import('./backup').BackupData): Promise<void>;
}

// Environment Ports
export interface ClockPort {
  today(): string;
}

export interface StoragePort {
  writeBackupFile(filename: string, content: string): Promise<string>;
  shareFile(fileUri: string, mimeType?: string, dialogTitle?: string): Promise<void>;
  pickBackupFile(): Promise<{ uri: string; content: string; name: string } | null>;
}

export interface WidgetPort {
  refresh(): Promise<void>;
}

export interface NotificationPort {
  requestPermission(): Promise<PermissionState>;
  scheduleDaily(spec: ScheduleDailySpec): Promise<void>;
  scheduleOnce(spec: ScheduleOnceSpec): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface SystemSettingsPort {
  openBatterySettings(): Promise<void>;
  openExactAlarmSettings(): Promise<void>;
}

export interface CapabilitiesPort {
  isExpoGo: boolean;
  supportsWidget: boolean;
}

