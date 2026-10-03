import { LogEntry } from '../core/types';

const MAX_LOGS = 100;
const ringBuffer: LogEntry[] = [];

export function log(
  level: 'info' | 'warn' | 'error',
  category: 'widget' | 'notification' | 'system' | 'general',
  message: string,
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
  };

  if (ringBuffer.length >= MAX_LOGS) {
    ringBuffer.shift();
  }
  ringBuffer.push(entry);
}

export function getLogs(): LogEntry[] {
  return [...ringBuffer];
}

export function clearLogs(): void {
  ringBuffer.length = 0;
}
