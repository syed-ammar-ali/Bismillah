import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 1;

export const journeyBackupSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  calendarType: z.enum(['hijri', 'gregorian']),
  startInput: z.string(),
  endInput: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number().int().positive(),
  deadlineLabel: z.string().nullable().optional(),
  deadlineDate: z.string().nullable().optional(),
  closingNote: z.string().nullable().optional(),
  completionShownAt: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  createdAt: z.string(),
  archivedAt: z.string().nullable().optional(),
});

export const taskBackupSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  title: z.string().min(1),
  note: z.string().nullable().optional(),
  kind: z.enum(['daily', 'makeup']),
  sortOrder: z.number().int().default(0),
  activeFromDay: z.number().int().positive().default(1),
  activeToDay: z.number().int().positive().nullable().optional(),
});

export const taskCompletionBackupSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  taskId: z.string(),
  dayNumber: z.number().int().positive(),
  completedAt: z.string(),
});

export const dayLogBackupSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  dayNumber: z.number().int().positive(),
  gapReason: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const milestoneSeenBackupSchema = z.object({
  journeyId: z.string(),
  dayNumber: z.number().int().positive(),
  shownAt: z.string(),
});

export const appSettingsBackupSchema = z.object({
  hijriAdjustment: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  reminderTime: z.string(),
  reminderEnabled: z.boolean(),
  eveningNudgeEnabled: z.boolean(),
  eveningNudgeTime: z.string(),
  onboardingDone: z.boolean(),
  batteryChecklistDone: z.boolean(),
  lastBackupAt: z.string().nullable().optional(),
});

export const backupDataSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  journeys: z.array(journeyBackupSchema),
  tasks: z.array(taskBackupSchema),
  task_completions: z.array(taskCompletionBackupSchema),
  day_logs: z.array(dayLogBackupSchema),
  milestones_seen: z.array(milestoneSeenBackupSchema),
  settings: appSettingsBackupSchema,
});

export type BackupData = z.infer<typeof backupDataSchema>;
