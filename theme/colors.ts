// ─── Obsidian Design System ──────────────────────────────────────────────────
// OLED-black base, amber-gold accent, glass-simulated surfaces.
// Every surface is near-transparent so true-black bleeds through on OLED.

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────
  bg: '#000000',                         // OLED perfect black
  bgElevated: '#0A0A0A',                 // screen-level elevation

  // ── Glass surfaces (simulated — no backdropBlur on Android) ────────
  // On OLED: the true-black behind + these dark translucent layers = glass
  glass: 'rgba(255, 255, 255, 0.04)',    // card/sheet base fill
  glassStrong: 'rgba(255, 255, 255, 0.07)', // raised cards
  glassBorder: 'rgba(255, 255, 255, 0.08)', // hairline border on glass
  glassHighlight: 'rgba(255, 255, 255, 0.12)', // active/pressed state

  // Backwards-compat & semantic aliases
  surface: 'rgba(255, 255, 255, 0.04)',
  surfaceRaised: 'rgba(255, 255, 255, 0.07)',
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // ── Gold accent ────────────────────────────────────────────────────
  gold: '#F59E0B',                       // Amber 500 — rich, warm, luminous
  goldSoft: '#FCD34D',                   // Amber 300 — highlights, secondary
  goldDim: 'rgba(245, 158, 11, 0.35)',   // glow fills, backgrounds
  goldGlow: 'rgba(245, 158, 11, 0.18)', // very faint ambient glow areas

  // ── Text ───────────────────────────────────────────────────────────
  text: '#F5F5F5',                       // Near-white, not harsh
  textSecondary: '#A3A3A3',              // Labels, subtitles
  textMuted: 'rgba(255, 255, 255, 0.35)', // Placeholders, hints

  // ── Semantic ───────────────────────────────────────────────────────
  gap: 'rgba(161, 161, 170, 0.6)',       // Neutral gray — never punishing
  danger: '#F87171',                     // Red 400 — errors only
  success: '#F59E0B',                    // same gold = achievement
} as const;

// Journey accent colors (one per journey card dot in calendar view)
export const journeyColors = [
  '#F59E0B', // amber
  '#818CF8', // indigo
  '#34D399', // emerald
  '#F472B6', // pink
] as const;

