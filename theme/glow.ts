export type GlowLevel = 0 | 1 | 2 | 3 | 4;

export interface GlowSpec {
  radius: number;
  opacity: number;
  hasPulse: boolean;
  hasSecondHalo: boolean;
}

// Glow levels mapped to white/silver bloom intensities.
// Each level corresponds to a streak tier (see design-system.md).
// Radii are larger than before — the bloom needs to be visible on black.
export const glowLevels: Record<GlowLevel, GlowSpec> = {
  0: { radius: 0,   opacity: 0,    hasPulse: false, hasSecondHalo: false },
  1: { radius: 60,  opacity: 0.18, hasPulse: false, hasSecondHalo: false },
  2: { radius: 90,  opacity: 0.28, hasPulse: false, hasSecondHalo: false },
  3: { radius: 120, opacity: 0.40, hasPulse: true,  hasSecondHalo: false },
  4: { radius: 160, opacity: 0.55, hasPulse: true,  hasSecondHalo: true  },
} as const;
