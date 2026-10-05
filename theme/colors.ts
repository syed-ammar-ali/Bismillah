// ─── Obsidian Design System ──────────────────────────────────────────────────
// OLED-black base, stark white/silver accents, glass-simulated surfaces.
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

  // ── Accents ────────────────────────────────────────────────────────
  gold: '#FFFFFF',                       // Stark White — primary accent, buttons
  goldSoft: '#E5E5E5',                   // Light Silver — highlights, secondary
  goldDim: 'rgba(255, 255, 255, 0.20)',  // glow fills, backgrounds
  goldGlow: 'rgba(255, 255, 255, 0.12)', // very faint ambient glow areas

  // ── Text ───────────────────────────────────────────────────────────
  text: '#F5F5F5',                       // Near-white, not harsh
  textSecondary: '#A3A3A3',              // Labels, subtitles
  textMuted: 'rgba(255, 255, 255, 0.35)', // Placeholders, hints

  // ── Semantic ───────────────────────────────────────────────────────
  gap: 'rgba(161, 161, 170, 0.6)',       // Neutral gray — never punishing
  danger: '#F87171',                     // Red 400 — errors only
  success: '#FFFFFF',                    // same as primary = achievement
} as const;

// Journey accent colors (one per journey card dot in calendar view)
export const journeyColors = [
  '#FFFFFF', // stark white
  '#A3A3A3', // neutral gray
  '#525252', // dark gray
  '#D4D4D8', // light silver
] as const;

