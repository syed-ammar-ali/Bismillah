// ─── Obsidian Typography System ──────────────────────────────────────────────
// Outfit (display, headings, numerals) + Inter (body, labels)
// Outfit: geometric, confident, modern — used by top-tier dark-mode products
// Inter: the industry standard for clarity at small sizes
//
// Scale follows a 1.25 major third — every step feels intentional.

export const fontFamilies = {
  display: 'Outfit_700Bold',       // Large display: journey names, day counts
  heading: 'Outfit_600SemiBold',   // Headings, section titles
  numeral: 'Outfit_800ExtraBold',  // Stats, streak numbers, percentages
  body: 'Inter_400Regular',        // All body copy
  label: 'Inter_500Medium',        // Labels, chips, captions
  labelStrong: 'Inter_600SemiBold',// Button labels, active labels
  cormorant: 'CormorantGaramond_600SemiBold',
} as const;

export const typography = {
  // Display — hero numbers, app identity moments
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  // Title — journey names, screen headings
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  // Heading — section headers, card titles
  heading: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  // Body — descriptions, notes, general copy
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  // Caption — secondary labels, dates, hints
  caption: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  // Numeral — large stats (streak, day count)
  numeral: {
    fontFamily: fontFamilies.numeral,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
  },
} as const;
