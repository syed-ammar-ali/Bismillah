export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screenPadding: 20,     // slightly wider — premium apps breathe
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  card: 24,              // glass cards — generously rounded
  sheet: 32,             // bottom sheets
  pill: 999,             // chips, badges, pill tab bar
  full: 9999,
} as const;

export const layout = {
  minTouchTarget: 48,
  taskCardHeight: 68,    // slightly taller — more breathing room
  dayCircleSize: 36,
  tabBarHeight: 64,      // floating pill height
  tabBarPillHeight: 56,
} as const;

// ─── Glass card helper ────────────────────────────────────────────────────────
// Use as style spread on any glass View.
// NOTE: No React — purely plain style objects for use in StyleSheet.create()
export const glass = {
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)' as const,
  },
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)' as const,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)' as const,
  },
  gold: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)' as const,
  },
} as const;
