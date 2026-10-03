import { addDaysToDate, getToday, subDaysFromDate } from '../core/dates';
import { Journey, Task, TaskCompletion } from '../core/types';
import { Repositories } from './repos';

export async function seedDatabase(repos: Repositories): Promise<void> {
  if (!__DEV__) {
    return;
  }

  const existing = await repos.journeyRepo.getAllIncludingArchived();
  if (existing.length > 0) {
    return;
  }

  const todayStr = getToday();
  const j1StartDate = subDaysFromDate(todayStr, 13); // today is day 14
  const j1EndDate = addDaysToDate(j1StartDate, 39); // 40 days total

  // Journey 1: "40 Days"
  const j1: Journey = {
    id: 'journey-40-days',
    name: '40 Days',
    calendarType: 'gregorian',
    startInput: j1StartDate,
    endInput: j1EndDate,
    startDate: j1StartDate,
    endDate: j1EndDate,
    totalDays: 40,
    deadlineLabel: 'Before Ramadan',
    deadlineDate: addDaysToDate(j1EndDate, 3),
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  };

  const j1Tasks: Task[] = [
    {
      id: 'task-fajr',
      journeyId: j1.id,
      title: 'Fajr on time',
      kind: 'daily',
      sortOrder: 0,
      activeFromDay: 1,
    },
    {
      id: 'task-quran',
      journeyId: j1.id,
      title: 'Quran 1 Juz',
      kind: 'daily',
      sortOrder: 1,
      activeFromDay: 1,
    },
    {
      id: 'task-dhikr',
      journeyId: j1.id,
      title: 'Morning & Evening Adhkar',
      kind: 'daily',
      sortOrder: 2,
      activeFromDay: 1,
    },
    {
      id: 'task-tahajjud',
      journeyId: j1.id,
      title: 'Tahajjud',
      kind: 'daily',
      sortOrder: 3,
      activeFromDay: 1,
    },
    {
      id: 'task-makeup-fast',
      journeyId: j1.id,
      title: 'Fast 1 make-up day',
      kind: 'makeup',
      sortOrder: 4,
      activeFromDay: 1,
    },
  ];

  await repos.journeyRepo.create(j1);
  await repos.taskRepo.createMany(j1Tasks);

  // Completions for Journey 1
  const j1Completions: TaskCompletion[] = [];
  const dailyTasks = j1Tasks.filter((t) => t.kind === 'daily');

  // Days 1-10: all sealed
  for (let d = 1; d <= 10; d++) {
    for (const t of dailyTasks) {
      j1Completions.push({
        id: `c-j1-${d}-${t.id}`,
        journeyId: j1.id,
        taskId: t.id,
        dayNumber: d,
        completedAt: new Date().toISOString(),
      });
    }
  }

  // Day 10 milestone seen
  await repos.milestoneRepo.markSeen(j1.id, 10, new Date().toISOString());

  // Day 11: gap with make-up task completed
  await repos.gapNoteRepo.setNote(j1.id, 11, 'Fever, stayed in bed');
  j1Completions.push({
    id: `c-j1-11-makeup`,
    journeyId: j1.id,
    taskId: 'task-makeup-fast',
    dayNumber: 11,
    completedAt: new Date().toISOString(),
  });

  // Day 12: gap with note
  await repos.gapNoteRepo.setNote(j1.id, 12, 'Travelled for work');

  // Day 13: sealed
  for (const t of dailyTasks) {
    j1Completions.push({
      id: `c-j1-13-${t.id}`,
      journeyId: j1.id,
      taskId: t.id,
      dayNumber: 13,
      completedAt: new Date().toISOString(),
    });
  }

  // Day 14 (today): 2 tasks completed
  j1Completions.push(
    {
      id: `c-j1-14-fajr`,
      journeyId: j1.id,
      taskId: 'task-fajr',
      dayNumber: 14,
      completedAt: new Date().toISOString(),
    },
    {
      id: `c-j1-14-quran`,
      journeyId: j1.id,
      taskId: 'task-quran',
      dayNumber: 14,
      completedAt: new Date().toISOString(),
    },
  );

  for (const c of j1Completions) {
    await repos.completionRepo.add(c);
  }

  // Journey 2: "Rajab & Sha'ban Preparation"
  const j2StartDate = subDaysFromDate(todayStr, 2);
  const j2EndDate = addDaysToDate(j2StartDate, 59);

  const j2: Journey = {
    id: 'journey-rajab-shaban',
    name: "Rajab & Sha'ban Preparation",
    calendarType: 'hijri',
    startInput: '1448-07-01',
    endInput: '1448-08-29',
    startDate: j2StartDate,
    endDate: j2EndDate,
    totalDays: 60,
    deadlineLabel: 'Ramadan Crescent',
    deadlineDate: addDaysToDate(j2EndDate, 1),
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  };

  const j2Tasks: Task[] = [
    {
      id: 'task-istighfar',
      journeyId: j2.id,
      title: 'Daily Astaghfirullah 100x',
      kind: 'daily',
      sortOrder: 0,
      activeFromDay: 1,
    },
    {
      id: 'task-mulk',
      journeyId: j2.id,
      title: 'Surah Al-Mulk before sleep',
      kind: 'daily',
      sortOrder: 1,
      activeFromDay: 1,
    },
    {
      id: 'task-sadaqah',
      journeyId: j2.id,
      title: 'Daily Sadaqah',
      kind: 'daily',
      sortOrder: 2,
      activeFromDay: 1,
    },
  ];

  await repos.journeyRepo.create(j2);
  await repos.taskRepo.createMany(j2Tasks);

  // Journey 3: "30 Days of Gratitude" (Completed)
  const j3StartDate = subDaysFromDate(todayStr, 45);
  const j3EndDate = subDaysFromDate(todayStr, 16);

  const j3: Journey = {
    id: 'journey-30-days-gratitude',
    name: '30 Days of Gratitude',
    calendarType: 'gregorian',
    startInput: j3StartDate,
    endInput: j3EndDate,
    startDate: j3StartDate,
    endDate: j3EndDate,
    totalDays: 30,
    closingNote: 'Alhamdulillah for the discipline and spiritual peace gained across these 30 days.',
    completionShownAt: new Date().toISOString(),
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  };

  const j3Tasks: Task[] = [
    {
      id: 'task-gratitude-journal',
      journeyId: j3.id,
      title: 'Write 3 blessings in journal',
      kind: 'daily',
      sortOrder: 0,
      activeFromDay: 1,
    },
    {
      id: 'task-gratitude-salawat',
      journeyId: j3.id,
      title: '100 Salawat on the Prophet',
      kind: 'daily',
      sortOrder: 1,
      activeFromDay: 1,
    },
  ];

  await repos.journeyRepo.create(j3);
  await repos.taskRepo.createMany(j3Tasks);

  // Complete all 30 days for Journey 3
  for (let d = 1; d <= 30; d++) {
    for (const t of j3Tasks) {
      await repos.completionRepo.add({
        id: `c-j3-${d}-${t.id}`,
        journeyId: j3.id,
        taskId: t.id,
        dayNumber: d,
        completedAt: new Date().toISOString(),
      });
    }
  }

  await repos.milestoneRepo.markSeen(j3.id, 10, new Date().toISOString());
  await repos.milestoneRepo.markSeen(j3.id, 20, new Date().toISOString());
  await repos.milestoneRepo.markSeen(j3.id, 30, new Date().toISOString());
}
