# Design System

Mood: calm, sacred, nocturnal elegance. Deep obsidian night sky, warm sacred gold/champagne accents, spiritual jewel tones, crescent motif. Dark theme optimized for OLED depth and contrast without flat monochrome monotony.

## Colors

| Token | Hex / Value | Use |
|---|---|---|
| bg | #08090E | Deep Obsidian Midnight Ink (OLED base) |
| bgElevated | #0E121C | Celestial Slate (screen elevation, sheets) |
| bgSubtle | #141A26 | Deep container fill |
| glass | rgba(255, 255, 255, 0.045) | Card & item base fill |
| glassStrong | rgba(255, 255, 255, 0.075) | Raised cards, sheets |
| glassBorder | rgba(255, 255, 255, 0.09) | Dividers, empty circles |
| glassBorderGold | rgba(229, 184, 105, 0.22) | Active / highlighted border |
| gold (primary) | #E5B869 | Sacred Warm Gold — primary accent, sealed days, rings |
| goldSoft | #F5DCA3 | Pale Champagne — highlights, glow core |
| goldDim | rgba(229, 184, 105, 0.22) | Amber Glow — fills on muted/in-range items |
| goldGlow | rgba(229, 184, 105, 0.12) | Ambient luminous radiance |
| emerald | #10B981 | Sacred Emerald — completion, peace, growth |
| azure | #38BDF8 | Celestial Azure — night sky, calendar highlights |
| amethyst | #A78BFA | Royal Amethyst — tahajjud, spiritual tiers |
| copper | #F97316 | Warm Terracotta — active streak momentum |
| text | #F8FAFC | Crisp near-white text |
| textSecondary | #94A3B8 | Slate secondary text, subtitles |
| textMuted | rgba(255, 255, 255, 0.38) | Placeholders, inactive hints |
| gap | rgba(148, 163, 184, 0.50) | Honest slate grey (never punishing) |
| danger | #F87171 | Soft Coral Red — delete & errors only |
| success | #10B981 | Sacred Emerald — achievement |

Journey colors (calendar dots, 6 harmonious jewel tones): #E5B869 Sacred Gold, #10B981 Emerald, #38BDF8 Celestial Azure, #A78BFA Royal Amethyst, #F97316 Terracotta, #F472B6 Rose Quartz.

Gaps are deliberately muted slate grey, not red. Honest, not punishing.

## Typography

- Headings and numbers: **Outfit** (600, 700, 800). Geometric, confident, modern. Matches top-tier monochrome interfaces. Used for day counts, journey names, big numbers.
- Body and UI: **Inter** (400, 500, 600). The industry standard for legibility.
- Arabic text (if added later): **Amiri**.
- Load via `expo-font` with `@expo-google-fonts/*`.

| Style | Font | Size | Weight |
|---|---|---|---|
| display | Outfit | 48 | 700 |
| title | Outfit | 26 | 700 |
| heading | Outfit | 18 | 600 |
| body | Inter | 15 | 400 |
| caption | Inter | 12 | 500 |
| numeral | Outfit | 32 | 800 |

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 24, 32.
- Screen padding: 20 (allows premium UI to breathe).
- Card radius: 24 (bento-box style). Sheets: 32. Buttons/Chips: 999 (pill).
- Cards: glass color, 1px subtle border, no heavy drop-shadows (relies purely on contrast).
- Min touch target: 48px.

## Core components

**Progress ring** (react-native-svg + Reanimated)
- Track: border color. Fill: white gradient (goldSoft to gold), round caps.
- Stroke 10 (large), 6 (small). Animates 600ms ease-out on change.

**Task card**
- Height 68, surface color. Left: circle checkbox. Right: title (+ note in caption).
- Done: circle fills white with check, title dims to textMuted with no strikethrough, card border turns silver (goldDim).
- Press: scale 0.98. Tick: haptic Light.

**Day circle (grid)**, size 36
- Sealed: white fill, number in bg color (no glow, see performance budget).
- Gap: transparent, border gap color, small dash.
- Made up: transparent, 2px white outline, number in white.
- Today: white ring, pulsing (scale 1 to 1.08, 1.6s loop).
- Future: border color, number in textMuted.

**Streak badge**: small crescent icon + number, glow per level.

**Journey card**: surface, ring left, text right, calendar badge top right. Completed journeys get a silver (goldDim) border and a small crescent badge.

**Bottom sheet**: surfaceRaised, top radius 32, drag handle.

**Tab bar**: bg color, icons in textMuted, active in white with a small crescent dot beneath.

## Crescent motif

- Custom SVG crescent (circle minus offset circle) in one reusable `Crescent` component, used for: app icon, streak badge, seal animation, completion screen, widget, empty states.
- Faint large crescent watermark (opacity 0.04) in the Today header background.

## Glow levels (streak)

| Level | Streak | Effect |
|---|---|---|
| 0 | 0-2 | None |
| 1 | 3-6 | Soft white shadow, radius 60, opacity 0.18 |
| 2 | 7-13 | Radius 90, opacity 0.28 |
| 3 | 14-24 | Radius 120, opacity 0.40, slow breathing pulse (3s) |
| 4 | 25+ | Radius 160, opacity 0.55, breathing pulse, plus a thin second halo ring |

Glow applies to the **streak badge, the progress ring and the journey hero only**, never to individual day circles. Implementation: one static SVG radial gradient layer behind the element (not `shadowColor`, not blur); the "breathing" is an opacity animation of that single layer. Levels 3 and 4 are the only looping glows, and at most one is visible per screen.

## Animations

| Moment | Spec |
|---|---|
| Tick | Check scales 0 to 1 (spring), card fill fades 200ms, haptic Light |
| Ring update | 600ms ease-out |
| **Seal** (all tasks done) | Reanimated + SVG, ~900ms: crescent scales in (spring) while a white radial halo expands (scale 0.6 to 1.4, opacity 0.6 to 0), ring pulses once, haptic Success, journey section collapses after 600ms |
| Milestone | Same halo burst, "Day 20 sealed" fades in, auto-dismiss 2.5s |
| Completion | Full-screen crescent rises (translateY + opacity, ~1.5s), a ring of 12 small white dots fades and scales outward once, stats fade in staggered |
| Day grid load | Circles fade in staggered (10ms each) |
| Screen transitions | Fade + 12px slide, 250ms |
| Pulse (today) | Loop 1.6s, scale 1 to 1.08 |

Respect Android "remove animations": when enabled, skip pulses, halos and the dot ring, keep instant state changes.

## Performance budget (budget Motorola)

Hard rules for every component:
- **No Lottie, no particle systems, no animated blur or shadows.** Animate only `transform` and `opacity` with Reanimated (UI thread).
- **At most one looping animation per screen** (today pulse or a level 3/4 glow). Everything else is one-shot.
- **Day grid:** plain `View` circles (fill, border, number). No gradients, no glow, no SVG per circle. Wrap `DayCircle` in `React.memo`; render the grid in one pass (max 120 items).
- **Progress ring:** one `Svg` with two `Circle` elements; animate `strokeDashoffset` with an animated prop.
- **Lists** (`FlatList`): stable keys, fixed-height rows with `getItemLayout`, no inline heavy functions.
- **Fonts:** load only Outfit (600, 700, 800) and Inter (400, 500, 600). Show the splash until fonts and the database are ready.
- **Images:** none beyond the app icon and splash. Crescent and icons are SVG.
- **Calendar:** custom day cells must be light (text + up to 4 dots); no per-cell animations.
- **Budget:** cold start under 2 s, tick feedback under 100 ms, steady 60 fps while scrolling Today and the day grid, measured on the **release APK**.
- If a screen misses the budget, remove effects before optimizing code (a plain white fill beats a slow glow).

## Haptics (expo-haptics)

- Tick: Light impact.
- Untick: Selection.
- Seal: Success notification.
- Milestone: Success notification, then Heavy impact.
- Errors (validation): Error notification.

## Icons

- Set: `lucide-react-native` (thin, consistent). Stroke 1.75.
- Tabs: Sun (Today), Moon/Layers (Journeys), CalendarDays (Calendar), Settings.

## Widget styling

- Background: bg with 90% opacity, radius 24.
- Ring: white on border track. Text: Inter for tasks, Outfit for numbers.
- Same crescent used when all sealed.

## App icon and splash

- Icon: white crescent on midnight gradient, adaptive icon (Android) with safe zone padding.
- Splash: bg color with centered crescent, fades into Today.

## Tone of copy

- Short, calm, no guilt. Examples: "Sealed", "Day 14 of 40", "Add a reason", "Make up this day".
- Never use red or "failed" for gaps.

## Accessibility

- Text contrast on bg at least 7:1 for body text.
- State is never conveyed by color alone (gap dash, made-up outline, check icon).
- Supports system font scaling up to 130%.
