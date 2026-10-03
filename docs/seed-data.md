# Seed Data

Development reference data for testing journeys, tasks, completions, gap reasons, make-up days, milestones and streaks.

## Journey 1: "40 Days" (Active Gregorian)
- **ID:** `journey-40-days`
- **Name:** "40 Days"
- **Calendar Type:** `gregorian`
- **Start Date:** 14 days ago (e.g. `2026-09-20`)
- **End Date:** +25 days from today (e.g. `2026-10-29`)
- **Total Days:** 40
- **Deadline:** "Before Ramadan" (`2026-11-01`)
- **Tasks:**
  1. `task-fajr`: "Fajr on time" (daily, sortOrder: 0, active 1..40)
  2. `task-quran`: "Quran 1 Juz" (daily, sortOrder: 1, active 1..40)
  3. `task-dhikr`: "Morning & Evening Adhkar" (daily, sortOrder: 2, active 1..40)
  4. `task-tahajjud`: "Tahajjud" (daily, sortOrder: 3, active 1..40)
  5. `task-makeup-fast`: "Fast 1 make-up day" (makeup, sortOrder: 4, active 1..40)
- **History:**
  - Days 1 to 10: All sealed.
  - Day 10 milestone: Seen.
  - Day 11: Gap, reason "Fever, stayed in bed", made up via `task-makeup-fast`. Status = `madeUp`.
  - Day 12: Gap, reason "Travelled for work". Status = `gap`.
  - Day 13: All sealed.
  - Day 14 (Today): 2 of 4 tasks completed (`task-fajr`, `task-quran`). Status = `today`.

## Journey 2: "Rajab & Sha'ban Preparation" (Active Hijri)
- **ID:** `journey-rajab-shaban`
- **Name:** "Rajab & Sha'ban Preparation"
- **Calendar Type:** `hijri`
- **Start Input:** `1448-07-01`
- **End Input:** `1448-08-29`
- **Start Date:** `2026-10-01`
- **End Date:** `2026-11-29`
- **Total Days:** 60
- **Deadline:** "Ramadan Crescent" (`2026-11-30`)
- **Tasks:**
  1. `task-istighfar`: "Daily Astaghfirullah 100x" (daily, sortOrder: 0)
  2. `task-mulk`: "Surah Al-Mulk before sleep" (daily, sortOrder: 1)
  3. `task-sadaqah`: "Daily Sadaqah" (daily, sortOrder: 2)
- **History:**
  - Days 1 to 3: All sealed.

## Journey 3: "30 Days of Gratitude" (Completed Gregorian)
- **ID:** `journey-30-days-gratitude`
- **Name:** "30 Days of Gratitude"
- **Calendar Type:** `gregorian`
- **Start Date:** `2026-08-01`
- **End Date:** `2026-08-30`
- **Total Days:** 30
- **Closing Note:** "Alhamdulillah for the discipline and spiritual peace gained across these 30 days."
- **Completion Shown At:** `2026-08-30T22:30:00.000Z`
- **Tasks:**
  1. `task-gratitude-journal`: "Write 3 blessings in journal" (daily, sortOrder: 0)
  2. `task-gratitude-salawat`: "100 Salawat on the Prophet" (daily, sortOrder: 1)
- **History:**
  - All 30 days sealed.
  - Milestones 10, 20, 30 marked seen.
