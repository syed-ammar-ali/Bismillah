# Product Requirements Document (PRD)

**Product:** Bismillah (package `com.bismillah.app`)
**Platform:** Android only. Developed in Expo Go; installed as a free, GitHub-built APK.
**Target device:** a budget Motorola phone. Speed on that phone is a requirement.
**Cost:** zero. No paid services, accounts or store fees.
**Users:** Single user (the owner). Personal app, no accounts, no backend, fully offline.
**Version:** 1.0 (single release, widget included)

Companion docs: `data-model.md`, `screens.md`, `design-system.md`, `architecture.md`, `ci-setup.md`, `build-plan.md`, `AGENTS.md`, `seed-data.md`.

---

## 1. Overview

A personal tracker for fixed-timeline spiritual journeys (e.g. 30, 40, 120 days). Each journey has its own daily tasks. Completing a day's tasks "seals" the day, building a streak that is visible, rewarding and beautiful. The timeline is fixed: a missed day appears as a gap, but dates never shift, because the owner's goals are anchored to real deadlines (e.g. before Ramadan).

## 2. Problem

Generic to-do and habit apps fail this use case:
- Streaks **reset** on a miss, which destroys a fixed plan that cannot be re-tailored.
- They don't support **Hijri-based** timelines alongside Gregorian ones.
- They don't support **multiple parallel journeys** with different lengths, each with its own tasks.
- They feel like checklists, not like a meaningful commitment.

## 3. Goals

1. Make completing daily tasks feel like keeping a streak, not ticking a list.
2. Support multiple concurrent journeys with fixed start/end dates in Hijri or Gregorian.
3. Keep the timeline immutable; show honest gaps without punishment, with a way to make them up.
4. Be glanceable: a home screen widget and daily reminders.
5. Be beautiful, calm and fast, and work fully offline.

## 4. Non-goals

- No social features, sharing, leaderboards or accounts.
- No cloud sync or backend.
- No iOS, no Play Store release, no paid tooling.
- No prayer times, Qibla, Quran text, or counters (dhikr is a simple tick).
- No streak reset that alters dates, and no editing the dates of a started journey.
- No phase 2; everything below ships in 1.0.

## 5. User

One person (the owner), Android phone, comfortable with JavaScript. Creates and manages their own journeys. Opens the app daily, usually morning and evening. Cares about discipline, spiritual intention and visual calm.

## 6. Core concepts

| Term | Meaning |
|---|---|
| Journey | A fixed-length challenge with a name, dates, calendar type and tasks |
| Daily task | A tick-only task due every day of the journey |
| Make-up task | Optional extra task used to complete a gap day |
| Sealed day | A day with all daily tasks done |
| Gap | A past day that was not sealed; timeline unchanged |
| Made up | A gap whose make-up tasks were all completed (stays visible as a gap with a gold outline) |
| Streak | Consecutive sealed days; a gap breaks the counter only |
| Milestone | Every 10th day and the final day |

## 7. Functional requirements

Priority: **P0** = must ship, **P1** = should ship in 1.0.

### 7.1 Journeys
- **FR-1 (P0)** Create a journey: name, calendar type (Hijri/Gregorian), start date, end date, optional deadline label + date.
- **FR-2 (P0)** Add, reorder and remove daily tasks (title, optional note). Minimum 1.
- **FR-3 (P0)** Add optional make-up tasks per journey.
- **FR-4 (P0)** Tasks are unique to a journey; no shared/repeated tasks.
- **FR-5 (P0)** Multiple journeys can run in parallel and overlap.
- **FR-6 (P0)** Dates of a journey that has started are locked. Name, deadline and tasks remain editable.
- **FR-7 (P0)** Task edits apply only from today onward; past days are never recalculated.
- **FR-8 (P0)** Archive and delete journeys (delete requires typing the name).
- **FR-9 (P0)** Journey states: Upcoming, Active, Completed.
- **FR-10 (P1)** Reorder journeys on the list.

### 7.2 Daily tracking
- **FR-11 (P0)** Today screen lists all tasks due today, grouped by journey, with an overall progress ring.
- **FR-12 (P0)** Tick/untick a task. Only today is editable; past days are locked.
- **FR-13 (P0)** When all daily tasks of a journey are done, the day is sealed with an animation and haptic.
- **FR-14 (P0)** Day number (1..N) is the identity of a day; dates are derived.
- **FR-15 (P0)** Midnight rollover is automatic; no manual action needed.

### 7.3 Streaks and gaps
- **FR-16 (P0)** Show current and best streak per journey.
- **FR-17 (P0)** Glow intensity on the streak badge, progress ring and journey hero scales with streak (5 levels). Day-grid circles stay plain for performance.
- **FR-18 (P0)** A missed day appears as a gap (muted, never red). The streak counter breaks; dates do not move.
- **FR-19 (P0)** User can add an optional reason to a gap day.
- **FR-20 (P0)** If the journey has make-up tasks, completing all of them for a gap day marks it "Made up" (gold outline). It does not restore the streak.
- **FR-21 (P0)** Make-up is allowed until the journey's end date.
- **FR-22 (P0)** A gap-alert banner on Today appears when yesterday was missed.

### 7.4 Calendar and dates
- **FR-23 (P0)** Calendar tab shows Gregorian and Hijri dates together per day.
- **FR-24 (P0)** Journey days appear as colored dots with state styling; filter by journey.
- **FR-25 (P0)** Tapping a day shows each active journey's tasks and status for that day.
- **FR-26 (P0)** Hijri adjustment setting (-1, 0, +1) with a live preview; applies to display immediately.
- **FR-27 (P0)** Hijri journeys are resolved to Gregorian dates once at creation. After changing the adjustment, ask whether to re-resolve active Hijri journeys (default: no).
- **FR-28 (P0)** Deadline countdown ("Before Ramadan · 126 days left") on the journey card and detail.

### 7.5 Journey detail
- **FR-29 (P0)** Progress ring, streak, stats (sealed, gaps, made up, best streak).
- **FR-30 (P0)** Day grid of all N days with sealed, gap, made-up, today and future states.
- **FR-31 (P0)** Tapping a grid day opens a sheet with date (both calendars), status, tasks, reason field and make-up section where applicable.

### 7.6 Celebration
- **FR-32 (P0)** Milestone overlay on days 10, 20, 30... and the final day, shown once each.
- **FR-33 (P0)** Completion screen when the final day is reached/sealed: stats, optional closing note.
- **FR-34 (P0)** Queue overlays so seal, milestone and completion play one at a time.

### 7.7 Widget (Android)
- **FR-35 (P0)** Small (2x2) widget: progress ring, done/total, streak, Hijri date.
- **FR-36 (P0)** Medium (4x2) widget: ring plus up to 3 pending tasks; tapping a task ticks it directly; tapping elsewhere opens the app.
- **FR-37 (P0)** Widget refreshes on every in-app change and after midnight (rebuilds itself if stale).
- **FR-38 (P0)** Widget states: all sealed, no journey today, normal.

### 7.8 Notifications
- **FR-39 (P0)** Daily reminder at a chosen time with live content ("Day 14 of 40 · 5 tasks waiting").
- **FR-40 (P1)** Optional evening nudge, sent only if today is unsealed (off by default).
- **FR-41 (P0)** Onboarding asks for notification permission and links to the system exact-alarm and battery pages; settings offers the same links plus a battery checklist the user confirms (battery state can't be detected).
- **FR-42 (P0)** Tapping a notification opens the Today tab.

### 7.9 Data and backup
- **FR-43 (P0)** All data stored locally in SQLite; no network required.
- **FR-44 (P0)** Export all data as JSON via the share sheet.
- **FR-45 (P0)** Import JSON with validation and overwrite confirmation.
- **FR-46 (P1)** Periodic "back up now" nudge in settings (when the last backup is older than 30 days).

### 7.10 Platform and diagnostics
- **FR-47 (P0)** The whole app runs in Expo Go. Widget, reminders and system-settings links are no-ops there and show "Available in the installed app"; nothing crashes.
- **FR-48 (P1)** Diagnostics screen (Settings > About): app and build version plus the last ~100 widget, notification and error events, without personal content. Needed because the APK can't be debugged with adb.
- **FR-49 (P0)** Builds are produced by GitHub Actions (`ci-setup.md`) and signed with a permanent personal key so updates install over the existing app and keep data.

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | On the release APK on the budget Motorola: cold start under 2 s, tick feedback under 100 ms, smooth scrolling. Effects are cut before speed is (see the performance budget in `design-system.md`) |
| Cost | 100% free: no paid accounts, services or store fees. GitHub free-tier minutes are the only metered resource |
| Reliability | No data loss on app kill; writes are transactional; reminders survive reboot |
| Offline | 100% functional with no connection |
| Privacy | No analytics, no network calls, no third-party SDKs that phone home |
| Accessibility | 7:1 text contrast; state never shown by color alone; supports font scale to 130%; respects "remove animations" |
| Compatibility | Android 8 (API 26) and above; Android 13+ notification permission handled |
| Size | Under ~40 MB APK (armeabi-v7a + arm64-v8a only) |
| Quality | Unit tests on all core logic (dates, status, streak, Hijri boundaries) |

## 9. Key user flows

1. **First launch:** intro, permissions (notifications, exact alarms, battery), empty Today, "Create your first journey".
2. **Create journey:** builder, set name/calendar/dates, add tasks and make-up tasks, save, journey appears on Today (if active) and Journeys.
3. **Daily use:** open Today (or widget), tick tasks, last tick seals the day with animation, streak grows.
4. **Missed day:** next day, banner shows the gap; user adds a reason and/or completes make-up tasks from the day sheet.
5. **Milestone/finish:** overlay at each 10th day; completion screen at the end.
6. **Hijri adjustment:** user changes ±1 after moon sighting; calendar updates; prompt about re-resolving journeys.
7. **Backup/restore:** export JSON, move to a new phone, import.

## 10. Edge cases and rules

- Journey starts in the future: appears as Upcoming, not on Today until its start date.
- Journey ends today and is sealed: completion screen fires immediately.
- Journey ends with unsealed days: still marked Completed after the end date; completion screen shows gaps honestly.
- Task added mid-journey: counts from today; earlier sealed days stay sealed.
- Task removed mid-journey: stops counting from today; earlier days unaffected.
- Unticking a task on a sealed day (today only) un-seals the day and updates streak.
- Phone date/timezone changed manually: today is recomputed on app open; past data is not rewritten.
- Hijri month length differences (29/30 days): resolved at creation; day count shown live in the builder.
- Journey with no make-up tasks: gap days can't be "made up"; only a reason can be added.
- App left open overnight: today refreshes on foreground and via a midnight timer.
- Overlapping journeys sharing a date: each seals independently.

## 11. Success criteria

The app succeeds if, for the owner:
- Every journey can be completed on its fixed timeline with no need to re-plan.
- Opening the app (or glancing at the widget) takes under 5 seconds to see what's pending today.
- Sealing a day feels rewarding enough to look forward to.
- No lost data across a phone change (via backup).
- Reminders arrive on time every day without manual rescheduling.

## 12. Release plan

Single release (1.0). Step 0 is a native spike (one widget + one notification) built as an APK to confirm both work on the owner's phone before features are built. Then: project setup, core logic + tests, database + services, screens, notifications, widget, backup, polish. Day-to-day work happens in Expo Go; the APK is rebuilt on GitHub Actions at defined gates and installed by sideloading. Detailed prompts in `build-plan.md`.

## 13. Assumptions and open questions

**Assumptions**
- Single user, single device, Android 8+.
- Device timezone is the source of "today".
- Tasks are tick-only; no counts, time or scheduling per task.

**Decisions made**
- App name: Bismillah. Icon: gold crescent on midnight blue (final artwork can be swapped later).
- Daily reminder defaults to 05:00. Evening nudge defaults to off.
- Closing notes are included in backups.
- A made-up day counts toward progress: progress = (sealed + made up) / total.
- No time-of-day task grouping, no rest/excused days.

**Open questions**
- None blocking. The first real journeys are entered by the owner in the journey builder.
