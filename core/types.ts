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

export type DayStatus = 'future' | 'today' | 'sealed' | 'gap' | 'madeUp';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'widget' | 'notification' | 'system' | 'general';
  message: string;
}
