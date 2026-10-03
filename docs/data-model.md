# Data Model

Storage: expo-sqlite + Drizzle ORM. Fully offline. All dates stored as `YYYY-MM-DD` strings.

## Core principles
1. Days are identified by **dayNumber (1..N)**, not by date. Changing the Hijri adjustment can shift the Gregorian date a day maps to, but never changes the timeline or any log.
2. **Nothing derived is stored.** Whether a day is sealed, a gap or made up is always computed from tasks + completions + today's date. Only user input is stored (completions, gap notes, journeys, tasks, settings) plus a few bookkeeping markers (`milestones_seen`, `completionShownAt`).

## Tables

### journeys
| Field | Type | Notes |
|---|---|---|
| id | text PK | uuid |
| name | text | e.g. "40 Days" |
| calendarType | text | `hijri` or `gregorian` |
| startInput | text | start date as entered, in its own calendar |
| endInput | text | end date as entered |
| startDate | text | resolved Gregorian start (used for all logic) |
| endDate | text | resolved Gregorian end |
| totalDays | int | derived from dates, stored for convenience, never edited |
| deadlineLabel | text? | e.g. "Before Ramadan" |
| deadlineDate | text? | Gregorian, for countdown |
| closingNote | text? | optional note written on the completion screen |
| completionShownAt | text? | ISO; set once the completion screen has been shown |
| sortOrder | int | list order |
| createdAt | text | ISO |
| archivedAt | text? | soft delete |

Hijri journeys: `startDate`/`endDate` are resolved once at creation using the current adjustment. Changing the adjustment later asks: "Re-resolve active Hijri journeys?" (default: no).

### tasks
| Field | Type | Notes |
|---|---|---|
| id | text PK | |
| journeyId | text FK | |
| title | text | |
| note | text? | optional detail |
| kind | text | `daily` or `makeup` |
| sortOrder | int | |
| activeFromDay | int | default 1 (supports tasks added mid-journey) |
| activeToDay | int? | null = still active (supports removal without breaking past days) |

Tasks are unique to one journey. Editing never rewrites history: adding sets `activeFromDay` to today's dayNumber, removing sets `activeToDay` to yesterday's dayNumber (the task stops counting from today).

### task_completions
| Field | Type | Notes |
|---|---|---|
| id | text PK | |
| journeyId | text FK | |
| taskId | text FK | |
| dayNumber | int | |
| completedAt | text | ISO timestamp |

Unique on (taskId, dayNumber). Unticking deletes the row.
Make-up completions use the **gap day's dayNumber**.

### day_logs (gap notes only)
| Field | Type | Notes |
|---|---|---|
| id | text PK | |
| journeyId | text FK | |
| dayNumber | int | unique with journeyId |
| gapReason | text? | optional note on a missed day |
| updatedAt | text | ISO |

A row exists only when the user wrote a reason. No row = no reason. This table holds no status.

### milestones_seen
| Field | Type | Notes |
|---|---|---|
| journeyId | text FK | |
| dayNumber | int | 10, 20, 30... or final day |
| shownAt | text | prevents replaying the celebration |

### settings (key/value)
| Key | Default | Notes |
|---|---|---|
| hijriAdjustment | 0 | -1, 0, +1 |
| reminderTime | "05:00" | HH:mm |
| reminderEnabled | true | |
| eveningNudgeEnabled | false | |
| eveningNudgeTime | "21:00" | HH:mm |
| onboardingDone | false | first-launch intro and permission prompts completed |
| batteryChecklistDone | false | user-confirmed; battery state can't be detected |
| lastBackupAt | null | ISO, drives the "back up now" nudge |

## Derived (never stored)

**Day status** for (journey, dayNumber), computed by `core/status.ts`:
- `future`: date is after today
- `today`: date is today and not yet sealed
- `sealed`: every daily task active on that dayNumber has a completion for it
- `gap`: date is past and not sealed
- `madeUp`: a gap where every make-up task active on that dayNumber has a completion (still shown as a gap, gold outline). Requires the journey to have at least one make-up task active on that day.

**Streak**
- Current streak: consecutive `sealed` days ending at today (or yesterday if today is not yet sealed).
- Best streak: longest consecutive sealed run.
- A gap resets the counter only. Dates never move.
- Make-up does NOT restore the streak; it only completes the day.

**Glow level** (0 to 4): 0 for 0-2, 1 for 3-6, 2 for 7-13, 3 for 14-24, 4 for 25+.

**Progress**: (sealed + madeUp days) / totalDays.

**Today view**: for each active journey where today's date falls in [startDate, endDate], list its daily tasks active on that dayNumber.

**Make-up availability**: only for gap days of journeys that have at least one `makeup` task. Allowed until the journey's end date.

**Unseen celebrations** (computed on foreground): a milestone dayNumber that is sealed but missing from `milestones_seen`; a journey whose end date has passed (or whose final day is sealed) with `completionShownAt` null.

## Seal detection
- There is no "seal" write. After every tick or untick, the service computes the day's status **before and after** with `core/status.ts`. Not sealed to sealed means a seal event: queue the seal animation, then check the milestone.
- Sealed to not sealed (untick, today only) simply removes the seal; the streak recomputes.
- Ticks made from the widget run the same service code. Their celebrations can't show (the app is closed), so on the next foreground the app computes **unseen celebrations** and queues them.

## Rollover
- Nothing runs at midnight. "Today" is recomputed on app open, on foreground, by a midnight timer while the app is open, and by the widget handler. Past unsealed days are gaps by definition.

## Widget snapshot (key-value store, not SQLite tables)
```json
{
  "date": "2026-10-03",
  "journeys": [
    {
      "id": "...", "name": "40 Days", "dayNumber": 14, "totalDays": 40,
      "streak": 14, "glow": 3, "done": 3, "total": 5,
      "pendingTasks": [{ "id": "...", "title": "..." }]
    }
  ],
  "hijriLabel": "21 Rabi' II"
}
```
A render cache only; always rebuildable from the database. Written on every tick, foreground and settings change.

## Backup format
Single JSON: `{ schemaVersion, exportedAt, journeys, tasks, task_completions, day_logs, milestones_seen, settings }`. Import replaces all data after confirmation. Closing notes are included (they live on `journeys`).
