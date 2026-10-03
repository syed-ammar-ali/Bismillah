import {
  CompletionRepo,
  GapNoteRepo,
  JourneyRepo,
  MilestoneRepo,
  SettingsRepo,
  TaskRepo,
} from '../../core/ports';
import { AppDatabase, db } from '../client';
import { DrizzleCompletionRepo } from './completionRepo';
import { DrizzleGapNoteRepo } from './gapNoteRepo';
import { DrizzleJourneyRepo } from './journeyRepo';
import { DrizzleMilestoneRepo } from './milestoneRepo';
import { DrizzleSettingsRepo } from './settingsRepo';
import { DrizzleTaskRepo } from './taskRepo';

export interface Repositories {
  journeyRepo: JourneyRepo;
  taskRepo: TaskRepo;
  completionRepo: CompletionRepo;
  gapNoteRepo: GapNoteRepo;
  milestoneRepo: MilestoneRepo;
  settingsRepo: SettingsRepo;
}

export function createRepositories(database: AppDatabase = db): Repositories {
  return {
    journeyRepo: new DrizzleJourneyRepo(database),
    taskRepo: new DrizzleTaskRepo(database),
    completionRepo: new DrizzleCompletionRepo(database),
    gapNoteRepo: new DrizzleGapNoteRepo(database),
    milestoneRepo: new DrizzleMilestoneRepo(database),
    settingsRepo: new DrizzleSettingsRepo(database),
  };
}

export {
  DrizzleCompletionRepo,
  DrizzleGapNoteRepo,
  DrizzleJourneyRepo,
  DrizzleMilestoneRepo,
  DrizzleSettingsRepo,
  DrizzleTaskRepo,
};
