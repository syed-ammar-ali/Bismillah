# Design System

Mood: calm, sacred, minimal. Deep night sky, warm gold, crescent motif. Dark theme only.

## Colors

| Token | Hex | Use |
|---|---|---|
| bg | #0B0F1A | App background (deep midnight blue) |
| surface | #141A2B | Cards |
| surfaceRaised | #1C2438 | Sheets, selected cards |
| border | #263049 | Dividers, empty circles |
| gold | #D4AF37 | Primary accent, sealed days, rings |
| goldSoft | #E8C964 | Highlights, glow core |
| goldDim | #8A7424 | Gold outlines on muted items |
| text | #F2EFE6 | Primary text (warm off-white) |
| textMuted | #8B93A7 | Secondary text |
| gap | #5A6277 | Gap markers |
| danger | #C25B5B | Delete only (never for gaps) |
| success | #D4AF37 | Same as gold (no green, keeps it cohesive) |

Journey colors (calendar dots, max 4 distinct, then repeat): #D4AF37 gold, #6FA8DC sky, #B58CD9 violet, #7FC8A9 mint.

Gaps are deliberately muted grey, not red. Honest, not punishing.

## Typography

- Headings and numbers: **Cormorant Garamond** (600). Elegant, sacred feel. Used for day counts, journey names, big numbers.
- Body and UI: **Inter** (400, 500, 600).
- Arabic text (if added later): **Amiri**.
- Load via `expo-font` with `@expo-google-fonts/*`.

| Style | Font | Size | Weight |
|---|---|---|---|
| display | Cormorant | 56 | 600 (ring center numbers) |
| title | Cormorant | 28 | 600 |
| heading | Inter | 18 | 600 |
| body | Inter | 15 | 400 |
| caption | Inter | 12 | 500 |

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 24, 32.
- Screen padding: 16.
- Card radius: 20. Chips: 999. Day circles: perfect circles.
- Cards: surface color, 1px border, no heavy shadows.
- Min touch target: 48px.

## Core components

**Progress ring** (react-native-svg + Reanimated)
- Track: border color. Fill: gold gradient (goldSoft to gold), round caps.
- Stroke 10 (large), 6 (small). Animates 600ms ease-out on change.

**Task card**
- Height 64, surface color. Left: circle checkbox. Right: title (+ note in caption).
- Done: circle fills gold with check, title dims to textMuted with no strikethrough, card border turns goldDim.
- Press: scale 0.98. Tick: haptic Light.

**Day circle (grid)**, size 36
- Sealed: gold fill, number in bg color (no glow, see performance budget).
- Gap: transparent, border gap color, small dash.
- Made up: transparent, 2px gold outline, number in gold.
- Today: gold ring, pulsing (scale 1 to 1.08, 1.6s loop).
- Future: border color, number in textMuted.

**Streak badge**: small crescent icon + number, glow per level.

**Journey card**: surface, ring left, text right, calendar badge top right. Completed journeys get a goldDim border and a small crescent badge.

**Bottom sheet**: surfaceRaised, top radius 28, drag handle.

**Tab bar**: bg color, icons in textMuted, active in gold with a small crescent dot beneath.

## Crescent motif

- Custom SVG crescent (circle minus offset circle) in one reusable `Crescent` component, used for: app icon, streak badge, seal animation, completion screen, widget, empty states.
- Faint large crescent watermark (opacity 0.04) in the Today header background.

## Glow levels (streak)

| Level | Streak | Effect |
|---|---|---|
| 0 | 0-2 | None |
| 1 | 3-6 | Soft gold shadow, radius 6, opacity 0.25 |
| 2 | 7-13 | Radius 10, opacity 0.35 |
| 3 | 14-24 | Radius 16, opacity 0.5, slow breathing pulse (3s) |
| 4 | 25+ | Radius 22, opacity 0.65, breathing pulse, plus a thin second halo ring |

Glow applies to the **streak badge, the progress ring and the journey hero only**, never to individual day circles. Implementation: one static SVG radial gradient layer behind the element (not `shadowColor`, not blur); the "breathing" is an opacity animation of that single layer. Levels 3 and 4 are the only looping glows, and at most one is visible per screen.

## Animations

| Moment | Spec |
|---|---|
| Tick | Check scales 0 to 1 (spring), card fill fades 200ms, haptic Light |
| Ring update | 600ms ease-out |
| **Seal** (all tasks done) | Reanimated + SVG, ~900ms: crescent scales in (spring) while a gold radial halo expands (scale 0.6 to 1.4, opacity 0.6 to 0), ring pulses once, haptic Success, journey section collapses after 600ms |
| Milestone | Same halo burst, "Day 20 sealed" fades in, auto-dismiss 2.5s |
| Completion | Full-screen crescent rises (translateY + opacity, ~1.5s), a ring of 12 small gold dots fades and scales outward once, stats fade in staggered |
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
- **Fonts:** load only Cormorant Garamond 600 and Inter 400, 500, 600. Show the splash until fonts and the database are ready.
- **Images:** none beyond the app icon and splash. Crescent and icons are SVG.
- **Calendar:** custom day cells must be light (text + up to 4 dots); no per-cell animations.
- **Budget:** cold start under 2 s, tick feedback under 100 ms, steady 60 fps while scrolling Today and the day grid, measured on the **release APK**.
- If a screen misses the budget, remove effects before optimizing code (a plain gold fill beats a slow glow).

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
- Ring: gold on border track. Text: Inter for tasks, Cormorant for numbers.
- Same crescent used when all sealed.

## App icon and splash

- Icon: gold crescent on midnight gradient, adaptive icon (Android) with safe zone padding.
- Splash: bg color with centered crescent, fades into Today.

## Tone of copy

- Short, calm, no guilt. Examples: "Sealed", "Day 14 of 40", "Add a reason", "Make up this day".
- Never use red or "failed" for gaps.

## Accessibility

- Text contrast on bg at least 7:1 for body text.
- State is never conveyed by color alone (gap dash, made-up outline, check icon).
- Supports system font scaling up to 130%.
