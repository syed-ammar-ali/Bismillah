export const MILESTONE_INTERVAL = 10;

export const GLOW_THRESHOLDS = {
  LEVEL_0_MAX: 2,
  LEVEL_1_MAX: 6,
  LEVEL_2_MAX: 13,
  LEVEL_3_MAX: 24,
  LEVEL_4_MIN: 25,
} as const;

export const DEFAULT_SETTINGS = {
  hijriAdjustment: 0,
  reminderTime: '05:00',
  reminderEnabled: true,
  eveningNudgeEnabled: false,
  eveningNudgeTime: '21:00',
  onboardingDone: false,
  batteryChecklistDone: false,
  lastBackupAt: null,
} as const;
