export type GlowLevel = 0 | 1 | 2 | 3 | 4;

export interface GlowSpec {
  radius: number;
  opacity: number;
  hasPulse: boolean;
  hasSecondHalo: boolean;
}

export const glowLevels: Record<GlowLevel, GlowSpec> = {
  0: { radius: 0, opacity: 0, hasPulse: false, hasSecondHalo: false },
  1: { radius: 6, opacity: 0.25, hasPulse: false, hasSecondHalo: false },
  2: { radius: 10, opacity: 0.35, hasPulse: false, hasSecondHalo: false },
  3: { radius: 16, opacity: 0.5, hasPulse: true, hasSecondHalo: false },
  4: { radius: 22, opacity: 0.65, hasPulse: true, hasSecondHalo: true },
} as const;
