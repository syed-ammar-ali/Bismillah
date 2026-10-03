import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const journeys = sqliteTable('journeys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  calendarType: text('calendar_type').$type<'hijri' | 'gregorian'>().notNull(),
  startInput: text('start_input').notNull(),
  endInput: text('end_input').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  deadlineLabel: text('deadline_label'),
  deadlineDate: text('deadline_date'),
  closingNote: text('closing_note'),
  completionShownAt: text('completion_shown_at'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  archivedAt: text('archived_at'),
});

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    note: text('note'),
    kind: text('kind').$type<'daily' | 'makeup'>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    activeFromDay: integer('active_from_day').notNull().default(1),
    activeToDay: integer('active_to_day'),
  },
  (table) => [index('tasks_journey_id_idx').on(table.journeyId)],
);

export const taskCompletions = sqliteTable(
  'task_completions',
  {
    id: text('id').primaryKey(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    completedAt: text('completed_at').notNull(),
  },
  (table) => [
    uniqueIndex('task_completions_task_day_uniq').on(table.taskId, table.dayNumber),
    index('task_completions_journey_day_idx').on(table.journeyId, table.dayNumber),
  ],
);

export const dayLogs = sqliteTable(
  'day_logs',
  {
    id: text('id').primaryKey(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    gapReason: text('gap_reason'),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('day_logs_journey_day_uniq').on(table.journeyId, table.dayNumber)],
);

export const milestonesSeen = sqliteTable(
  'milestones_seen',
  {
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    shownAt: text('shown_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.journeyId, table.dayNumber] })],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type JourneyRow = typeof journeys.$inferSelect;
export type TaskRow = typeof tasks.$inferSelect;
export type TaskCompletionRow = typeof taskCompletions.$inferSelect;
export type DayLogRow = typeof dayLogs.$inferSelect;
export type MilestoneSeenRow = typeof milestonesSeen.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
