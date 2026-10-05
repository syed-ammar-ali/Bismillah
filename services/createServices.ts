import {
  CapabilitiesPort,
  ClockPort,
  NotificationPort,
  StoragePort,
  SystemSettingsPort,
  WidgetPort,
} from '../core/ports';
import { Repositories } from '../db/repos';
import { AfterWriteOrchestrator } from './afterWrite';
import { BackupService } from './backupService';
import { CelebrationService } from './celebrationService';
import { GapService } from './gapService';
import { JourneyService } from './journeyService';
import { NotificationService } from './notificationService';
import { RolloverService } from './rolloverService';
import { SettingsService } from './settingsService';
import { TickService } from './tickService';
import { WidgetService } from './widgetService';

export interface ServiceDeps {
  repos: Repositories;
  clock: ClockPort;
  notifications: NotificationPort;
  widget: WidgetPort;
  systemSettings: SystemSettingsPort;
  storage: StoragePort;
  capabilities: CapabilitiesPort;
}

export interface AppServices {
  tickService: TickService;
  celebrationService: CelebrationService;
  gapService: GapService;
  journeyService: JourneyService;
  rolloverService: RolloverService;
  notificationService: NotificationService;
  widgetService: WidgetService;
  backupService: BackupService;
  settingsService: SettingsService;
  afterWrite: AfterWriteOrchestrator;
}

export function createServices(deps: ServiceDeps): AppServices {
  const notificationService = new NotificationService(
    deps.repos.journeyRepo,
    deps.repos.taskRepo,
    deps.repos.completionRepo,
    deps.repos.settingsRepo,
    deps.notifications,
    deps.clock,
  );
  const widgetService = new WidgetService(deps.widget);
  const afterWrite = new AfterWriteOrchestrator(widgetService, notificationService);

  const celebrationService = new CelebrationService(deps.repos.milestoneRepo, deps.clock);
  const tickService = new TickService(
    deps.repos.journeyRepo,
    deps.repos.taskRepo,
    deps.repos.completionRepo,
    deps.clock,
    celebrationService,
    afterWrite,
  );
  const gapService = new GapService(
    deps.repos.journeyRepo,
    deps.repos.taskRepo,
    deps.repos.completionRepo,
    deps.repos.gapNoteRepo,
    deps.clock,
    afterWrite,
  );
  const journeyService = new JourneyService(
    deps.repos.journeyRepo,
    deps.repos.taskRepo,
    deps.repos.settingsRepo,
    deps.clock,
    afterWrite,
  );
  const rolloverService = new RolloverService(
    deps.repos.journeyRepo,
    deps.repos.taskRepo,
    deps.repos.completionRepo,
    deps.repos.gapNoteRepo,
    deps.repos.milestoneRepo,
    deps.repos.settingsRepo,
    deps.clock,
    celebrationService,
    afterWrite,
  );
  const backupService = new BackupService(
    deps.repos.backupRepo,
    deps.storage,
    deps.repos.settingsRepo,
    deps.clock,
    rolloverService,
  );
  const settingsService = new SettingsService(
    deps.repos.settingsRepo,
    journeyService,
    deps.notifications,
    deps.systemSettings,
    deps.capabilities,
    afterWrite,
  );

  return {
    tickService,
    celebrationService,
    gapService,
    journeyService,
    rolloverService,
    notificationService,
    widgetService,
    backupService,
    settingsService,
    afterWrite,
  };
}
