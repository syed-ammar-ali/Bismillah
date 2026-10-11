// ─── Obsidian Design System ──────────────────────────────────────────────────
// OLED-black base, stark white/silver accents, glass-simulated surfaces.
// Every surface is near-transparent so true-black bleeds through on OLED.

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────
  bg: '#08090E',                         // Deep Obsidian Midnight Ink
  bgElevated: '#0E121C',                 // Screen elevation / modal background
  bgSubtle: '#141A26',                   // Deep container fill

  // ── Glass surfaces (simulated — no backdropBlur on Android) ────────
  glass: 'rgba(255, 255, 255, 0.045)',    // card/sheet base fill
  glassStrong: 'rgba(255, 255, 255, 0.075)', // raised cards
  glassBorder: 'rgba(255, 255, 255, 0.09)', // hairline border on glass
  glassBorderGold: 'rgba(229, 184, 105, 0.22)', // active/gold-tinted border
  glassHighlight: 'rgba(255, 255, 255, 0.12)', // active/pressed state

  // Backwards-compat & semantic aliases
  surface: 'rgba(255, 255, 255, 0.045)',
  surfaceRaised: 'rgba(255, 255, 255, 0.075)',
  surfaceGlass: 'rgba(255, 255, 255, 0.045)',
  border: 'rgba(255, 255, 255, 0.09)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',

  // ── Sacred Gold / Amber (Primary Accents) ──────────────────────────
  gold: '#E5B869',                       // Sacred Warm Gold — primary accent, buttons
  goldSoft: '#F5DCA3',                   // Light Champagne — highlights, glow core
  goldDim: 'rgba(229, 184, 105, 0.22)',  // glow fills, backgrounds
  goldGlow: 'rgba(229, 184, 105, 0.12)', // ambient radiant glow

  // ── Spiritual Jewel Accents (Non-monotonous dark mode) ──────────────
  emerald: '#10B981',                    // Sacred Emerald — peace, completion, success
  emeraldDim: 'rgba(16, 185, 129, 0.18)',// subtle emerald badge fill
  azure: '#38BDF8',                      // Celestial Azure — night sky, calendar highlights
  azureDim: 'rgba(56, 189, 248, 0.18)',  // subtle azure badge fill
  amethyst: '#A78BFA',                   // Royal Amethyst — tahajjud, spiritual elevation
  amethystDim: 'rgba(167, 139, 250, 0.18)', // subtle amethyst badge fill
  copper: '#F97316',                     // Warm Terracotta / Amber — streak momentum

  // ── Text ───────────────────────────────────────────────────────────
  text: '#F8FAFC',                       // Crisp near-white
  textSecondary: '#94A3B8',              // Slate secondary labels, subtitles
  textMuted: 'rgba(255, 255, 255, 0.38)', // Placeholders, hints

  // ── Semantic ───────────────────────────────────────────────────────
  gap: 'rgba(148, 163, 184, 0.50)',       // Honest slate gray — never punishing
  danger: '#F87171',                     // Red 400 — errors and destructive only
  success: '#10B981',                    // Emerald — achievement
} as const;

// Journey accent colors (one per journey card dot in calendar view)
export const journeyColors = [
  '#E5B869', // Sacred Gold
  '#10B981', // Emerald Green
  '#38BDF8', // Celestial Azure
  '#A78BFA', // Royal Amethyst
  '#F97316', // Warm Terracotta
  '#F472B6', // Rose Quartz
] as const;

