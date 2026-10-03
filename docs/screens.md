# Screens

Mobile only (Android). Dark theme, gold accent, crescent motif. Navigation: Expo Router, bottom tab bar with 4 tabs: **Today, Journeys, Calendar, Settings**. Journey detail, Journey builder and Completion screen are stack screens above the tabs.

Colors, fonts and animation specs live in `design-system.md`. Data rules live in `data-model.md`.

---

## 1. Today (tab 1, default)

**Purpose:** do everything due today in one place.

**Layout (top to bottom)**
- Header: Gregorian date + Hijri date (adjusted), e.g. "Sat 3 Oct · 21 Rabi' al-Awwal".
- Overall ring: tasks done / total across all journeys today. Center text: "7 / 12".
- One section per active journey:
  - Journey name, "Day 14 of 40", streak flame/crescent with glow.
  - Task cards (tap to tick).
  - Section collapses automatically once the journey is sealed.
- Gap alerts (if any): small banner "Yesterday was missed in 40 Days. Add a reason or make up".

**Behavior**
- Tick: haptic tap, card fills gold with a check, ring animates.
- Last task of a journey: **seal animation** (crescent scales in with a gold halo, haptic success; Reanimated + SVG), then section collapses.
- Untick allowed for today only.
- Journeys that haven't started or have ended don't appear.
- Empty state (no active journeys): "No journeys today" with a button to create one.

---

## 2. Journeys (tab 2)

**Purpose:** overview of every journey.

**Layout**
- Vertical list of journey cards, ordered by `sortOrder` (long-press to reorder).
- Each card:
  - Name, calendar badge (Hijri / Gregorian).
  - Progress ring: sealed days / total.
  - "Day X of N", current streak, best streak.
  - Deadline countdown if set ("Before Ramadan · 126 days left").
  - Today's status chip: "3 of 5 done" or "Sealed".
- States: **Upcoming** (starts in X days, dimmed), **Active**, **Completed** (gold border, crescent badge).
- Floating "+" button opens the Journey builder.
- Tap a card opens Journey detail.

---

## 3. Journey detail (stack)

**Layout**
- Header: name, back, edit (pencil), overflow menu (archive, delete).
- Hero: large progress ring with day count, streak number, glow that scales with streak level (0 to 4).
- Today's tasks (same tick cards as Today screen).
- **Day grid:** all N days as circles in rows of 8.
  - Sealed: filled gold.
  - Gap: empty circle with a small dash.
  - Made up: empty circle with gold outline.
  - Today: pulsing ring.
  - Future: dim outline.
  - Day numbers inside each circle.
- Stats row: sealed, gaps, made up, best streak.

**Tapping a day in the grid** opens a bottom sheet:
- Date (Gregorian + Hijri), status.
- Task list with completion state (read-only for past days).
- If **gap**: reason field (editable) and a **Make-up tasks** section if the journey has any. Ticking all of them marks the day "Made up".
- If **future**: shows the day's tasks, nothing editable.

---

## 4. Calendar (tab 3)

**Layout**
- Month view (react-native-calendars) with custom day cells.
- Each cell: big Gregorian number, small Hijri number beneath.
- Header shows both month names (e.g. "October 2026 · Rabi' al-Awwal / Rabi' al-Thani").
- Journey markers: colored dots under each day, one color per journey (max 4 shown, then "+").
- Day state shown by dot style: filled = sealed, hollow = gap, gold ring = made up.
- Journey filter chips above the calendar (All or a single journey).
- Deadline days get a small flag icon.

**Behavior**
- Tap a day: bottom sheet listing each journey active that day, with status and tasks.
- Today highlighted. Swipe to change month.
- Hijri adjustment (settings) applies here immediately.

---

## 5. Settings (tab 4)

**Sections**
- **Hijri date:** adjustment selector (-1 / 0 / +1) with live preview of today's Hijri date. On change, ask whether to re-resolve active Hijri journeys (default: no).
- **Reminders:** enable toggle, time picker, evening nudge toggle + time, test notification button.
- **Android reliability:** notification permission status (detectable), buttons to open the system "Battery" and "Exact alarms" pages, and a checklist the user ticks once done (battery state can't be detected).
- **Widget:** short how-to for adding the widget.
- **Backup:** Export JSON (share sheet), Import JSON (file picker, confirm overwrite), "Last backup: date" with a nudge when older than 30 days.
- **About:** app version and build number, and a link to **Diagnostics** (last ~100 events and errors, no personal content).

**Expo Go note:** the widget, reminders and system-settings buttons are unavailable in Expo Go. They show "Available in the installed app" and do nothing; the app never errors.

---

## 6. Journey builder (stack, create and edit)

**Form (react-hook-form + zod), single scrolling page**
1. Name (required).
2. Calendar type: Hijri / Gregorian toggle.
3. Start date and end date. Hijri mode shows a Hijri date picker with the Gregorian equivalent underneath. Total days shown live ("40 days").
4. Deadline (optional): label + date.
5. **Daily tasks:** add, reorder, remove. Each has title and optional note.
6. **Make-up tasks:** same list UI, optional.
7. Save.

**Validation**
- End date after start date. Name required. At least 1 daily task.
- Overlap with other journeys is allowed.

**Edit rules (journeys in progress)**
- Dates of a started journey are locked (timeline is fixed); name, deadline and tasks stay editable.
- Adding a task applies from today onward. Removing a task applies from today onward. Past days are never recalculated.
- Delete requires typing the journey name.

---

## 7. Completion screen (stack, full screen)

Shown once when the final day is sealed (or the journey ends after the end date).

- Large crescent rising into place, with a single ring of small gold dots fading outward (one-shot, no particle system).
- "Day 40 complete".
- Stats: sealed days, gaps, made-up days, best streak, start and end dates.
- Optional closing note field (saved to the journey).
- Button: "Done". The journey card becomes **Completed**.

## 8. Milestone moment

At days 10, 20, 30... and the final day (once per milestone):
- Short overlay with a glow burst, "Day 20 sealed", current streak.
- Auto-dismisses after 2.5 seconds or on tap.

---

## 9. Widget (Android home screen)

Two sizes, gold on dark, reads the snapshot defined in `data-model.md`.

**Small (2x2):** progress ring with done/total for today, streak number, Hijri date.

**Medium (4x2):** ring on the left; on the right, the pending tasks for the first journey with unfinished tasks (max 3). Tapping a task ticks it directly; tapping elsewhere opens the app.

**Rules**
- Refreshes on every tick, midnight rollover and settings change.
- If every journey is sealed: shows "All sealed" with a crescent.
- If no active journey: shows "No journey today".

---

## 10. Notifications

- One daily reminder at the chosen time: "Day 14 of 40 · 5 tasks waiting".
- Optional evening nudge (e.g. 9 PM) only if today is not sealed: "2 tasks left in 40 Days". Enabled in settings, off by default.
- Tapping opens the Today tab.
- Rescheduled on app open, reboot and settings change.

---

## 11. First launch

- Short 2-screen intro: what the app does, then Android reliability prompts (notification permission, exact alarms, battery unrestricted).
- Ends on an empty Today screen with "Create your first journey".
