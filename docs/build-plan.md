# Build Plan

Ordered prompts for Antigravity. Feed **one step at a time**, verify its checkpoint, then move on. Don't skip ahead.

**How you work**
- Day to day: `npx expo start`, scan the QR with **Expo Go** on your phone (`npx expo start --tunnel` if phone and laptop are on different networks). Create the project with the Expo SDK that matches the Expo Go app on your phone.
- The widget, reminders and real speed can't be judged in Expo Go. At the **APK gates** (after Steps 0, 8, 12, 14, 15) you build the APK on GitHub (free) and test on the phone. See `ci-setup.md`.

**Docs to attach to every session:** `AGENTS.md` (also in the repo root) and all files in `/docs`.

**Start of every step, paste this**
```
Follow AGENTS.md and /docs exactly. Work only on this step. State the FR IDs you cover and the files you will touch before coding.
When finished, list files created/changed, test/lint/typecheck results, and the checkpoint I should verify.
```

---

## Your one-time manual steps (not for the agent)

1. Create a **private** GitHub repo `bismillah` and push the project (after Step 0 creates it).
2. Create the signing key and secrets exactly as in `ci-setup.md` section 4, **after** Step 0 has added the workflows.
3. On the phone: install **Expo Go**, enable "Install unknown apps" for your browser or file manager.

---

## Step 0: Repo, CI and native spike

Purpose: prove on your phone that a CI-built APK installs, updates in place, shows a widget and fires a notification, **before** any feature work.

**Prompt**
```
Create the Expo project "bismillah" (TypeScript, Expo Router) with the folder layout from architecture.md section 4 (placeholders fine).
Add app.config.ts, .gitignore (including android/ and ios/), package scripts typecheck, lint, test (one trivial passing Jest test), a custom index.ts entry that imports expo-router/entry and registers the widget handler only when not in Expo Go, and the two workflow files exactly as in ci-setup.md (build-apk.yml, generate-keystore.yml).
Install with `npx expo install`: expo-notifications, expo-sqlite, expo-intent-launcher, expo-constants, expo-build-properties, react-native-android-widget.
Create platform/ per architecture.md section 3 and 4: ports in core/ports.ts, noop adapters, real WidgetPort and NotificationPort (lazy require), platform/index.ts choosing by Constants.executionEnvironment.
Build a throwaway screen app/spike.tsx showing: isExpoGo, a counter stored in expo-sqlite/kv-store with +1 button, "Schedule test notification in 1 minute", "Schedule daily reminder at HH:mm", "Cancel all", and a list of the latest log lines.
Build a minimal 2x2 widget (react-native-android-widget) showing the counter, with a tap that increments it and re-renders, registered via the config plugin with updatePeriodMillis 1800000.
In Expo Go the spike screen must work without crashing (native parts no-op).
```
**Checkpoint (Expo Go):** app opens, spike screen shows `isExpoGo: true`, counter works, no crashes. `npm run typecheck`, `lint`, `test` pass.

**You do:** push to GitHub, set up the signing key (`ci-setup.md` section 4), run "Build APK".

### APK Gate 0 (must pass before Step 1)
- [ ] CI build finishes and gives `bismillah.apk`; note the SHA-256 printed by `apksigner verify`.
- [ ] APK installs; spike screen shows `isExpoGo: false`.
- [ ] Widget appears in the widget picker, can be added, shows the counter.
- [ ] Tapping the widget increments the counter and the app shows the same number.
- [ ] Notification scheduled for 1 minute arrives **with the app closed**.
- [ ] Daily reminder arrives next day at the set time (leave it overnight while you continue with Step 1).
- [ ] After a phone reboot the widget still renders and the daily reminder still fires.
- [ ] Second build (change one text) **installs over** the first, counter preserved, same SHA-256.
- [ ] Set battery to Unrestricted and re-test if any reminder was late.

**If anything fails, stop and report it before continuing.** The architecture may need adjusting.

---

## Step 1: Project setup

**Prompt**
```
Finish project setup per architecture.md and AGENTS.md.
Install with `npx expo install`: react-native-reanimated, react-native-svg, react-native-calendars, expo-haptics, expo-file-system, expo-sharing, expo-document-picker, expo-font, @expo-google-fonts/cormorant-garamond, @expo-google-fonts/inter, lucide-react-native, drizzle-orm, zustand, @umalqura/core, date-fns, react-hook-form, zod, @hookform/resolvers.
Dev dependencies: drizzle-kit, babel-plugin-inline-import, jest-expo, @types/jest, eslint + expo config, prettier.
Do NOT install lottie-react-native, expo-dev-client or eas-cli.
Configure: tsconfig strict (noUncheckedIndexedAccess, noImplicitOverride), path alias @/*, babel (reanimated plugin last, inline-import for .sql), metro (add sql to sourceExts), drizzle.config.ts for the expo driver, Jest (jest-expo, node environment for core), ESLint with import-boundary rules from AGENTS.md section 4, Prettier.
Add theme/ files from design-system.md (colors, typography, spacing, glow) and core/constants.ts.
Load only Cormorant Garamond 600 and Inter 400/500/600; keep the splash visible until fonts are ready.
```
**Checkpoint (Expo Go):** dark empty screen with the correct fonts. `npm run typecheck`, `lint`, `test` pass. `npx expo install --check` is clean.

---

## Step 2: Core logic and tests

**Prompt**
```
Implement everything in core/ per architecture.md section 5 and data-model.md "Derived" and "Seal detection":
dates.ts, hijri.ts (with ±1 adjustment), timeline.ts, status.ts (rule lookup, no derived data stored), streak.ts, progress.ts, milestones.ts (including unseenCelebrations), constants.ts, ports.ts (all repo and platform interfaces, types only), types.ts (including Result).
Also a pure function that compares a day's status before and after a change and returns whether it was newly sealed.
All pure, `today` always passed in.
Jest tests covering:
- inclusive day count, dayNumberFor/dateFor, dates outside range
- Hijri conversion with adjustment -1/0/+1 at month boundaries, 29 vs 30 day months
- status: future/today/sealed/gap/madeUp, tasks added or removed mid-journey (activeFromDay/activeToDay), journey with no make-up tasks (never madeUp)
- streak: gap breaks counter, today unsealed uses yesterday, best streak, glow levels
- milestones: every 10th day and the final day (including when total is not a multiple of 10); unseen celebrations
- seal transition: not sealed to sealed, sealed to not sealed (untick)
- journey ending today
```
**Checkpoint:** all tests pass. Nothing in core/ imports React, Expo or db.

---

## Step 3: Database and repositories

**Prompt**
```
Implement db/schema.ts with Drizzle exactly as in data-model.md (journeys, tasks, task_completions, day_logs [gap notes only], milestones_seen, settings) including indexes and unique constraints.
Create db/client.ts (open expo-sqlite, WAL, foreign keys on), generate migrations with drizzle-kit (expo driver), apply them on startup in app/_layout.tsx with useMigrations before the router renders.
Implement repositories in db/repos/ that implement the ports in core/ports.ts (CRUD only, no business logic, plain typed objects, transactions for multi-row writes).
Add a dev-only seed script that creates the three journeys and the seeded history from seed-data.md, reachable only in development (never bundled in production builds).
```
**Checkpoint (Expo Go):** app starts, migrations run, seeded data can be read and logged, and survives an app restart.

---

## Step 4: Services and stores

**Prompt**
```
Implement services/ per architecture.md: createServices(deps), tickService (toggle with before/after seal detection), celebrationService, gapService, journeyService (Hijri-to-Gregorian resolution at creation; edit rules: dates locked after start, task changes apply from today), rolloverService (set today, RELOAD THE STORE FROM THE DB, compute unseen celebrations, afterWrite), notificationService and widgetService (build content/snapshot, call the ports), backupService (stub), afterWrite, logger (ring buffer in kv-store, no user content).
Implement stores/: useAppStore, useJourneyStore, useUiStore (overlay queue).
Wire repos and platform adapters into the services in app/_layout.tsx only.
Add hooks: useToday, useTodayViewModel, useJourneyViewModel.
Write service tests with in-memory fake repositories, fake ports and a fake clock: tick, seal event, untick un-seals, past days locked, gap reason, make-up completion, edits mid-journey, unseen celebrations after a foreground.
```
**Checkpoint:** tests pass. A temporary debug screen in Expo Go can tick a task and show the status updating.

---

## Step 5: Design system components

**Prompt**
```
Build the reusable components from design-system.md, obeying its performance budget:
ui/ (Text, Button, Sheet, Chip, Icon, Crescent), ProgressRing (one Svg, two Circles, animated strokeDashoffset), TaskCard, DayCircle (plain View, React.memo), DayGrid, StreakBadge (5 glow levels using a single static radial gradient layer), JourneyCard, tab bar styling.
Implement tick spring animation, ring animation and the today pulse with Reanimated (transform and opacity only), and respect the system "remove animations" setting.
Create a temporary dev-only gallery screen showing every component in every state, including a 120-day grid.
```
**Checkpoint (Expo Go):** gallery matches the design doc in all states (sealed, gap, made-up, today, future; glow 0 to 4; task done/undone).

---

## Step 6: Today and Journeys tabs

**Prompt**
```
Build the tab layout (Today, Journeys, Calendar placeholder, Settings placeholder) and implement screens.md sections 1 and 2.
Today: dual date header, overall ring, per-journey sections with task cards, auto-collapse when sealed, gap-alert banner, empty state.
Journeys: list of journey cards with ring, day X of N, streaks, deadline countdown, Upcoming/Active/Completed states, long-press reorder, "+" button (opens the builder placeholder).
Wire to view-model hooks; ticking uses tickService with haptics.
```
**Checkpoint (Expo Go, seeded data):** ticking updates rings, streaks and sealing live; sealed journeys collapse.

---

## Step 7: Journey builder

**Prompt**
```
Implement app/journey/new.tsx and [id]/edit.tsx per screens.md section 6 using react-hook-form + zod.
Fields: name, calendar type, start/end dates (Hijri picker showing the Gregorian equivalent and live total days), deadline label/date, daily tasks (add/reorder/remove), make-up tasks.
Validation: end after start, name required, at least 1 daily task.
Edit mode: dates locked once started; task changes apply from today; delete requires typing the journey name; archive supported.
Hijri journeys resolve to Gregorian at creation using the current adjustment (journeyService).
```
**Checkpoint (Expo Go):** create a Hijri and a Gregorian journey from the UI; day counts are right. A started journey's dates can't be changed.

---

## Step 8: Journey detail and day sheet

**Prompt**
```
Implement app/journey/[id].tsx and the DaySheet per screens.md section 3.
Hero ring with glow, streak, stats row, today's tasks, full day grid (plain Views, staggered fade-in limited to the first screenful), tapping a day opens the sheet:
date in both calendars, status, task completion (read-only for past), gap reason field, make-up tasks section that marks the day "Made up" when all are ticked.
```
**Checkpoint (Expo Go, seeded data):** create a gap, add a reason, complete make-up tasks, and see the day turn gold-outlined while the streak stays broken.

### APK Gate A: speed on the Motorola (after Step 8)
Build the APK, install it, create a 120-day journey with 6 tasks in the builder, then check:
- [ ] Cold start feels under 2 s; tick response feels instant.
- [ ] Scrolling Today, the 120-day grid and the Journeys list is smooth.
- [ ] Opening and closing sheets is smooth.
If anything stutters, **remove effects first** (glow, staggered fades) before optimizing code. Report what you saw.

---

## Step 9: Calendar tab

**Prompt**
```
Implement screens.md section 4 with react-native-calendars and light custom day cells (Gregorian number, Hijri number beneath, up to 4 journey dots, state styling filled/hollow/gold ring, deadline flag), journey filter chips, dual month header, and a tap-to-open day sheet listing every active journey's tasks and status.
```
**Checkpoint (Expo Go):** Hijri numbers look right; swiping months is smooth.

---

## Step 10: Settings, Hijri adjustment and Diagnostics

**Prompt**
```
Implement screens.md section 5: Hijri adjustment (-1/0/+1) with live preview and the "re-resolve active Hijri journeys?" prompt (default no), reminder toggle and time picker, evening nudge toggle and time, Android reliability section (notification permission status, buttons through SystemSettingsPort, battery checklist), widget how-to, backup section (buttons wired in Step 13, last-backup date), About with version/build and a link to the Diagnostics screen (app/diagnostics.tsx showing the logger ring buffer).
Persist everything in the settings table. In Expo Go, native-only items show "Available in the installed app".
```
**Checkpoint (Expo Go):** the adjustment changes display everywhere (Today header, calendar, builder preview) without altering stored journey dates unless the user confirms re-resolution.

---

## Step 11: Celebrations

**Prompt**
```
Implement the overlay queue and screens.md sections 7 and 8 using Reanimated + SVG only (no Lottie):
SealAnimation (crescent scale-in, expanding halo, ring pulse, success haptic, ~900ms), MilestoneOverlay (days 10, 20, 30... and the final day, once each via milestones_seen, auto-dismiss 2.5s), and the completion screen (crescent rising, one ring of 12 gold dots fading outward, stats, optional closing note saved to the journey, Done sets completionShownAt).
Overlays play one at a time in order: seal, milestone, completion. Also queue unseen celebrations found by rolloverService on foreground.
Respect the system "remove animations" setting.
```
**Checkpoint (Expo Go):** sealing the last task triggers seal then milestone (if applicable); milestones never replay after restart; finishing the final day opens the completion screen once.

---

## Step 12: Notifications and onboarding

**Prompt**
```
Finish the real NotificationPort in platform/notifications.ts and notificationService per architecture.md section 10: Android channel, permission request, daily repeating reminder at the chosen time with live body text, optional evening nudge only if today is unsealed (cancelled on seal), idempotent refresh() that cancels and reschedules everything, tap routing to the Today tab. Call refresh() through afterWrite.
Finish SystemSettingsPort (open battery and exact-alarm settings via expo-intent-launcher).
Add the 2-screen onboarding (screens.md section 11) with permission and system-settings prompts; skip the native prompts gracefully in Expo Go.
```
**Checkpoint (Expo Go):** onboarding and settings work with no crashes and no-op notifications.

### APK Gate B: reminders (after Step 12)
- [ ] Reminder arrives at the set time with the app closed; the text reflects current progress.
- [ ] It still arrives after a phone reboot.
- [ ] Evening nudge appears only when the day is unsealed, and disappears after sealing.
- [ ] Tapping the notification opens Today.
- [ ] The Diagnostics screen shows the scheduling events.

---

## Step 13: Backup and restore

**Prompt**
```
Implement backupService: export all tables to JSON with schemaVersion (data-model.md "Backup format") via expo-sharing and update lastBackupAt; import via expo-document-picker with zod validation and overwrite confirmation, replacing all tables in one transaction, then rolloverService.reconcile().
Show the 30-day "back up now" nudge in settings.
```
**Checkpoint (Expo Go):** export, wipe app data, import: journeys, completions, reasons, closing notes, settings and milestones are restored identically.

---

## Step 14: Widget

**Prompt**
```
Finish the widget per architecture.md section 9 and screens.md section 9 using react-native-android-widget:
small (2x2) and medium (4x2) layouts, gold on dark, snapshot in expo-sqlite/kv-store, widgetService.refresh() through afterWrite, handler rebuilds the snapshot when snapshot.date !== today, updatePeriodMillis 30 minutes, click actions TICK_TASK (calls tickService) and OPEN_APP (deep link to Today), states: normal / all sealed / no journey today.
Replace the Step 0 spike widget. Keep the handler registration guarded for Expo Go. Handler wraps everything in try/catch and logs to the diagnostics buffer.
```
**Checkpoint (Expo Go):** app still runs with the widget code skipped.

### APK Gate C: widget (after Step 14)
- [ ] Both widget sizes can be added and look right (gold on dark).
- [ ] Ticking in the app updates the widget; ticking in the widget updates the app on next open (store reloads).
- [ ] Sealing a day from the widget shows its celebration the next time the app opens.
- [ ] After midnight with the app closed, the widget shows the new day.
- [ ] Reboot: the widget still renders.

---

## Step 15: Polish and hardening

**Prompt**
```
Final pass:
- Midnight timer + AppState foreground refresh of `today`
- Error boundary, DB failure screen, toasts for service errors
- App icon (adaptive, gold crescent), splash screen
- Accessibility: contrast, labels, font scale to 130%, non-color state indicators
- Remove the dev gallery, spike screen and seed script from production builds
- Check APK size (target under ~40 MB) and remove unused dependencies
Then walk through the manual test checklist below and fix issues.
```

### APK Gate D: final (after Step 15)
- [ ] Create Hijri and Gregorian journeys, verify day counts and dates
- [ ] Tick all tasks: seal, glow, streak, widget update
- [ ] Skip a day (change the phone date for testing, then restore it): gap appears, timeline unchanged
- [ ] Add a reason and complete make-up: gold outline, streak still broken
- [ ] Milestone at day 10 shows once
- [ ] Final day: completion screen once
- [ ] Hijri adjustment ±1 and the re-resolve prompt
- [ ] Reboot: reminder fires, widget renders
- [ ] Midnight with the app closed: widget and Today show the new day
- [ ] Backup, wipe app data, restore
- [ ] Kill the app mid-tick: no corrupted data
- [ ] Update-in-place: install a newer build over this one; data preserved, same SHA-256
- [ ] Speed on the Motorola still meets the budget

---

## Release routine

1. Tag `v1.0.0` (or run the workflow manually), download `bismillah.apk`, install.
2. Allow notifications, allow exact alarms if offered, set battery to **Unrestricted**, add the widget.
3. Confirm your real journeys in the builder, then export a backup and save it to Drive.
4. Keep the keystore and its password safe (`ci-setup.md` section 4). Without them you can't update in place.
5. Later changes: develop in Expo Go, run the workflow, install over the existing app.

---

## Tips for working with Antigravity

- Review the diff after every step before moving on; commit at each checkpoint (`git commit -m "step N"`).
- If it drifts from the docs, paste the relevant section back and say "match this exactly".
- Keep core/ tests green; they protect your streak logic.
- If Expo Go behaves strangely after a dependency change, restart with `npx expo start -c`.
- Test date-dependent behavior by injecting a fake clock in tests (never by editing `core/dates.ts`).
- Don't spend GitHub minutes on every change: build only at the gates or when you need to test native behavior.
