import { PermissionState, ScheduleDailySpec, ScheduleOnceSpec } from './types';

// Repositories (will be expanded in Step 3 per data-model.md)
export interface JourneyRepo {
  getAll(): Promise<unknown[]>;
}

export interface TaskRepo {
  getByJourney(journeyId: string): Promise<unknown[]>;
}

export interface CompletionRepo {
  getByDay(journeyId: string, dayNumber: number): Promise<unknown[]>;
}

export interface GapNoteRepo {
  getNote(journeyId: string, dayNumber: number): Promise<string | null>;
}

export interface MilestoneRepo {
  getSeen(journeyId: string): Promise<number[]>;
}

export interface SettingsRepo {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

// Environment Ports
export interface ClockPort {
  today(): string;
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
