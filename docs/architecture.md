# Architecture

**Bismillah**: Expo (managed), TypeScript strict, Android only. Offline, no backend, no accounts, no paid services.
Developed in **Expo Go**; shipped as an APK built free on GitHub Actions (see `ci-setup.md`).
Companion docs: `prd.md`, `data-model.md`, `screens.md`, `design-system.md`, `ci-setup.md`.

## 1. Principles

1. **Pure core, thin shell.** All date, status and streak logic lives in pure TypeScript functions (no React, no DB, no Expo imports). Fully unit-testable.
2. **Nothing derived is stored.** Day status, streak, glow, progress and seal events are computed from journeys + tasks + completions + today's date (see `data-model.md`). Midnight rollover is automatic.
3. **One write path.** Every mutation (tick, untick, reason, make-up, edit) goes through a service that finishes with one `afterWrite()` call: widget refresh + notification refresh.
4. **Day number is the identity**, never the date.
5. **One "today" source.** A single `ClockPort` / `getToday()` used everywhere, injectable for tests.
6. **Native features sit behind ports.** Widget and notifications are reached only through `platform/` adapters, so the app runs in Expo Go (where those adapters do nothing) and fully in the APK.
7. **Light on a budget phone.** Target device: low-cost Motorola. No heavy libraries, no per-frame JS animation work (see `design-system.md` performance budget).

## 2. Layers

```
UI (app/, components/)
  ↓ reads hooks, calls actions
State (stores/)            Zustand: thin cache + UI state
  ↓
Services (services/)       orchestration; receive repos + ports as parameters
  ↓                    ↘
Repositories (db/repos/)   Platform adapters (platform/)
  ↓                          ↓
SQLite (expo-sqlite)       expo-notifications, react-native-android-widget,
                           expo-intent-launcher (lazy, Expo Go safe)

Core (core/)               pure logic + port interfaces (types only)
```

Rules: UI never touches the DB or `platform/`. Repositories and adapters never call services. Core imports nothing outside `core/` and `date-fns` / `@umalqura/core`.

## 3. Ports (dependency inversion)

Interfaces live in `core/ports.ts` (types only). Implementations live in `db/repos/` and `platform/`.

```ts
// data
JourneyRepo, TaskRepo, CompletionRepo, GapNoteRepo, MilestoneRepo, SettingsRepo
// environment
ClockPort            { today(): string }
WidgetPort           { refresh(): Promise<void> }
NotificationPort     { requestPermission(): Promise<PermissionState>;
                       scheduleDaily(spec): Promise<void>;
                       scheduleOnce(spec): Promise<void>;
                       cancelAll(): Promise<void> }
SystemSettingsPort   { openBatterySettings(): Promise<void>;
                       openExactAlarmSettings(): Promise<void> }
CapabilitiesPort     { isExpoGo: boolean; supportsWidget: boolean }
```

- `platform/index.ts` builds the adapters once at startup. If `Constants.executionEnvironment === 'storeClient'` (Expo Go), it returns **no-op adapters** (they log to the diagnostics buffer and resolve). Otherwise it returns the real ones.
- Real adapters load their native library with a lazy `require()` inside the function, never a top-level import, so Expo Go never evaluates a missing native module.
- Services take ports as parameters (via a small `createServices(deps)` factory built in the root layout). Tests pass fakes.

## 4. Folder structure

```
index.ts                     custom entry: imports expo-router/entry; registers the
                             widget task handler only when not in Expo Go
app.config.ts                Expo config (reads VERSION_CODE)
app/                         Expo Router
  _layout.tsx                providers, fonts, db init, migrations, services
  (tabs)/
    _layout.tsx              tab bar
    today.tsx
    journeys.tsx
    calendar.tsx
    settings.tsx
  journey/
    [id].tsx                 detail
    new.tsx                  builder (create)
    [id]/edit.tsx            builder (edit)
  complete/[id].tsx          completion screen
  diagnostics.tsx            recent events + errors (no adb needed)
  onboarding.tsx
components/
  ring/ProgressRing.tsx
  tasks/TaskCard.tsx
  grid/DayGrid.tsx, DayCircle.tsx
  journey/JourneyCard.tsx, StreakBadge.tsx
  calendar/DayCell.tsx
  overlays/SealAnimation.tsx, MilestoneOverlay.tsx
  sheets/DaySheet.tsx
  ui/ (Text, Button, Sheet, Chip, Icon, Crescent)
core/
  dates.ts                   getToday, toISO, daysBetween
  hijri.ts                   toHijri, fromHijri, adjustment handling
  timeline.ts                dayNumberFor(date), dateFor(dayNumber), totalDays
  status.ts                  dayStatus(...)
  streak.ts                  currentStreak, bestStreak, glowLevel
  progress.ts                journey progress, today's task list
  milestones.ts              isMilestone(day, total), unseenCelebrations(...)
  constants.ts               MILESTONE_INTERVAL, glow thresholds
  ports.ts                   repo + platform interfaces (types only)
  types.ts                   shared domain types, Result
db/
  client.ts                  open db, drizzle instance
  schema.ts                  Drizzle tables
  migrations/                generated SQL
  repos/                     journeys, tasks, completions, gapNotes, milestones, settings
platform/
  index.ts                   picks real or no-op adapters
  noop.ts                    Expo Go / test adapters
  notifications.ts           real NotificationPort (expo-notifications)
  widget.ts                  real WidgetPort
  systemSettings.ts          real SystemSettingsPort (expo-intent-launcher)
services/
  createServices.ts          wires repos + ports into services
  tickService.ts             tick/untick, seal-event detection
  celebrationService.ts      milestone + completion detection and queueing
  gapService.ts              reasons, make-up
  journeyService.ts          create/edit/archive/delete + Hijri date resolution
  rolloverService.ts         foreground reconciliation (today, reload, celebrations)
  notificationService.ts     builds reminder content, calls NotificationPort
  widgetService.ts           builds snapshot, calls WidgetPort
  backupService.ts           export/import
  afterWrite.ts              widget refresh + notification refresh
  logger.ts                  ring buffer (kv-store) feeding Diagnostics
stores/
  useAppStore.ts             today, settings, hydrated flag
  useJourneyStore.ts         journeys + tasks + completions cache
  useUiStore.ts              overlay queue (seal, milestone, completion)
hooks/
  useToday.ts, useJourneyViewModel.ts, useTodayViewModel.ts
widget/                      loaded only outside Expo Go
  register.ts                registerWidgetTaskHandler
  TodayWidget.tsx            small + medium layouts
  widgetHandler.ts           render, click actions (tick)
  snapshot.ts                read/write snapshot (kv-store)
theme/
  colors.ts, typography.ts, spacing.ts, glow.ts
assets/
  fonts/, icon, splash
tests/
  core/*.test.ts, services/*.test.ts
.github/workflows/
  build-apk.yml, generate-keystore.yml (delete after use)   see ci-setup.md
```

## 5. Core modules (pure)

**timeline.ts**
- `totalDays(start, end)` = inclusive day count.
- `dayNumberFor(journey, date)` returns 1..N, or null if outside range.
- `dateFor(journey, dayNumber)` returns the Gregorian date.

**hijri.ts**
- `toHijri(date, adjustment)`, `fromHijri(y, m, d, adjustment)`.
- Wraps `@umalqura/core`; the adjustment shifts the Gregorian date by -1/0/+1 before conversion.
- Used for display and for resolving Hijri journey inputs at creation. Journey logic always runs on Gregorian `startDate` / `endDate`.

**status.ts**
```ts
dayStatus(journey, dayNumber, today, tasks, completions)
  => 'future' | 'today' | 'sealed' | 'gap' | 'madeUp'
```
- Sealed = every daily task active on that day has a completion for that day.
- Gap = past date and not sealed. Made up = gap and at least one make-up task is active that day and all are completed.
- Implemented with a lookup of rules, not a growing if/else chain.

**streak.ts**: `currentStreak`, `bestStreak`, `glowLevel(streak)` per `design-system.md`.

**progress.ts**: `todayTasks(journeys, today)`, `journeyProgress(...)` = (sealed + madeUp) / total.

**milestones.ts**: `isMilestone(dayNumber, total)`, `unseenCelebrations(journey, statuses, milestonesSeen)`.

All take plain data in and return plain data out.

## 6. Data flow

**Tick a task**
1. UI calls `tickService.toggle(taskId, dayNumber)`.
2. Service checks the rule (only today is editable), writes or deletes the completion row.
3. Computes the day's status before and after (core). Not sealed to sealed is a **seal event**: `celebrationService` queues seal, then milestone, then completion if applicable (marking `milestones_seen` / `completionShownAt` when shown).
4. Updates the store after the DB write.
5. `afterWrite()`: `widgetService.refresh()` and `notificationService.refresh()`.
6. UI re-renders from the store; the overlay queue plays one overlay at a time.

**App open / foreground** (`rolloverService.reconcile()`)
1. Set `today` from the clock.
2. **Reload the store from the database.** The widget can change data while the app is closed or backgrounded, and it runs in a separate JS context, so the in-memory store must never be trusted after a foreground.
3. Compute **unseen celebrations** (milestones sealed but not in `milestones_seen`, completed journeys with `completionShownAt` null) and queue them.
4. `afterWrite()`.
5. Keep `today` fresh with an `AppState` listener plus a timer set to the next midnight while the app is active.

**Journey creation**
1. Builder form (zod validated) calls `journeyService.create(input)`.
2. If Hijri: resolve start/end to Gregorian using the current adjustment; store both input and resolved dates.
3. Insert journey and tasks (daily and make-up) in one transaction.

## 7. State (Zustand)

- `useAppStore`: `today`, `settings`, `hydrated`.
- `useJourneyStore`: normalized `journeys`, `tasks`, `completions` keyed by journey + day, loaded at startup and on every foreground. Writes go through services, which update the store after the DB write.
- `useUiStore`: overlay queue, bottom sheet state.
- View-model hooks combine store data with core functions via `useMemo`; screens stay declarative.
- Data volume is tiny (a few journeys × up to ~120 days), so everything is held in memory and screens render instantly.

## 8. Database

- expo-sqlite with Drizzle, following the Drizzle docs for the Expo driver: `drizzle.config.ts` with the `expo` driver, `.sql` added to Metro `sourceExts`, `babel-plugin-inline-import` for migration files, `useMigrations` on startup before rendering the router.
- Foreign keys on, `PRAGMA journal_mode=WAL` (the widget's headless context opens its own connection).
- Indexes: `task_completions(journeyId, dayNumber)`, unique `(taskId, dayNumber)`, unique `day_logs(journeyId, dayNumber)`.
- Multi-row changes (journey create, delete, import) run in transactions.
- Dates are ISO strings; timestamps ISO with offset.

## 9. Widget architecture (Android, APK only)

- Library: `react-native-android-widget` via its config plugin (applied during `expo prebuild` in CI). Widgets: `TodayWidget` small (2x2) and medium (4x2).
- The widget task handler runs in a headless JS context inside the app. It is registered from `widget/register.ts`, required by `index.ts` **only when not in Expo Go**.
- The handler imports `core/`, `db/repos/` and the service factory, so numbers can never disagree with the app.
- **Snapshot** in `expo-sqlite/kv-store` for fast render, written by `widgetService.refresh()`.
- **Render:** on add, update and resize: read the snapshot; if `snapshot.date !== today`, rebuild from the DB first (handles midnight with the app closed).
- **Update period:** 30 minutes (Android minimum) plus an explicit refresh after each in-app write.
- **Click actions:** `TICK_TASK` (taskId) calls `tickService.toggle`, rebuilds the snapshot, re-renders. `OPEN_APP` deep-links to Today.
- Because the widget writes from a separate context, the app reloads its store on every foreground (section 6).
- In Expo Go the widget cannot run. Layouts can be iterated in the APK, or previewed in-app if the library offers a preview component.

## 10. Notifications

- `expo-notifications`, local only, behind `NotificationPort`. Channel `daily-reminder`. Android 13+ permission requested in onboarding.
- Daily reminder: repeating trigger at the user's time, body built from current state ("Day 14 of 40 · 5 tasks waiting"), rebuilt after each tick and on foreground so the text stays fresh.
- Evening nudge (optional): one-off for tonight, scheduled only if today is unsealed; cancelled when the day seals.
- `notificationService.refresh()` cancels all and reschedules from scratch. Idempotent, called from `afterWrite()`.
- Exact alarms: onboarding and settings open the system exact-alarm and battery pages through `SystemSettingsPort` (`expo-intent-launcher`). If exact alarms are denied, reminders can drift by a few minutes; that is acceptable.
- Battery state cannot be detected from JS, so settings shows a checklist the user confirms (`batteryChecklistDone`).
- In Expo Go, notification support is limited and unreliable on recent SDKs. Treat Expo Go as UI-only for notifications and verify in the APK.
- Tap handling: response listener routes to the Today tab.

## 11. Backup

- Export: read all tables in one transaction, write JSON with `schemaVersion`, share via `expo-sharing`, update `lastBackupAt`.
- Import: validate with zod, confirm overwrite, replace all tables in one transaction, then `rolloverService.reconcile()`.
- `schemaVersion` allows future migrations of the backup format.

## 12. Error handling and diagnostics

- DB init or migration failure: full-screen error with "Export what's possible" and "Retry".
- Services return typed `Result`; UI shows short toasts.
- Widget handler wraps everything in try/catch and falls back to the last good snapshot.
- Global error boundary at the root layout.
- **Diagnostics screen** (Settings > About): shows the last ~100 log entries (widget events, notification scheduling results, caught errors, app version and build number). `logger.ts` keeps a ring buffer in the kv-store. This replaces adb for debugging the APK. Logs never include task titles or notes.

## 13. Testing

- **Jest (`jest-expo` preset)** for everything; core tests run in the node environment.
- `core/` (the critical part): timeline edge cases, Hijri month boundaries with ±1 adjustment, streak across gaps, make-up behavior, task added/removed mid-journey, journeys ending today, seal-event detection.
- Services are tested with **in-memory fake repositories and ports** (no SQLite in tests; repos are interfaces).
- Repositories and adapters are verified manually through the build-plan checkpoints.
- Manual checklist (build-plan APK Gate D): widget tick, reboot with reminder, midnight rollover with app closed, backup round-trip.

## 14. Build, config and delivery

- **Daily development:** `npx expo start`, scan the QR in Expo Go. `--tunnel` if the phone and laptop are on different networks. Create the project with the Expo SDK that matches the Expo Go version on your phone.
- **APK:** GitHub Actions only (`ci-setup.md`): `expo prebuild`, `gradlew assembleRelease` for armeabi-v7a + arm64-v8a, re-sign with your keystore, download the artifact. `android/` is generated in CI and git-ignored.
- `app.config.ts`: `android.package` `com.bismillah.app`, `versionCode` from `VERSION_CODE`, dark UI, permissions (`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`).
- Plugins: `expo-router`, `expo-notifications`, `expo-sqlite`, `expo-font`, `expo-build-properties`, `react-native-android-widget`. No `expo-dev-client`, no EAS, no Lottie.
- Reanimated Babel plugin last in `babel.config.js`.
- TypeScript strict, ESLint + Prettier, path alias `@/*`.
- Scripts: `typecheck`, `lint`, `test` (CI runs all three).

## 15. Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Widget and notifications can't be tested in Expo Go | Step 0 spike APK on the real phone before building features; APK gates at steps 8, 12, 14, 15 |
| Widget shows a stale day after midnight | Snapshot carries its date; handler rebuilds from the DB when stale |
| Widget writes make the app's store stale | Reload the store on every foreground |
| Celebrations missed when ticking from the widget | Unseen-celebration check on foreground |
| Hijri date differs from local moon sighting | Manual ±1 adjustment; journeys resolved once at creation |
| Android battery killing reminders | Battery checklist + deep links to system pages; Motorola near-stock Android helps |
| Lost phone loses the streak | JSON export plus a monthly "back up now" nudge |
| Lost signing key blocks in-place updates | Keystore backed up outside GitHub; JSON backup protects the data regardless |
| Timeline corruption by edits | Locked dates after start; task changes apply only from today; dayNumber identity |
| Sluggish on a budget phone | Performance budget in `design-system.md`; judge speed on the release APK only |
| Library incompatibility with the Expo SDK | `npx expo install`, pin versions, `npx expo install --check` |
| GitHub free minutes run out | Manual-only builds, caching; fallbacks in `ci-setup.md` section 9 |
