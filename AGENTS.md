# AGENTS.md

Rules for any AI agent working on this repo (**Bismillah**). Read this file and `/docs` before every task. These rules are mandatory, not suggestions.

## 0. Source of truth

- `/docs/prd.md`: what to build. `/docs/architecture.md`: how it is structured. `/docs/data-model.md`: data and derived rules. `/docs/screens.md`: behavior. `/docs/design-system.md`: look, feel and performance budget. `/docs/ci-setup.md`: builds and signing. `/docs/build-plan.md`: order of work. `/docs/seed-data.md`: example data.
- If code and docs conflict, **stop and ask**. Never silently choose.
- Do not add features, screens, libraries or settings that are not in the docs.
- Work on **one build-plan step at a time**. Do not jump ahead.

## 1. Project facts (never violate)

- Expo (managed), TypeScript **strict**, Android only, fully offline. No backend, no analytics, no network calls.
- Developed and tested in **Expo Go**. The release APK is built by **GitHub Actions** (`ci-setup.md`). The `android/` folder is generated in CI and never committed.
- **Everything must be free.** No paid services, no paid accounts, no Play Store, no EAS dependency, no library that needs a paid key.
- Target device: a **budget Motorola**. Performance rules in section 11 are part of the requirements.
- A day is identified by **dayNumber (1..N)**, never by date.
- **Nothing derived is stored** (day status, sealed/made-up, streak, glow, progress are computed).
- Journey dates are locked once the journey starts. Task edits apply from today onward only. Past days are never rewritten.
- All dates are `YYYY-MM-DD` strings. "Today" comes only from `ClockPort` / `getToday()`; never call `new Date()` outside `core/dates.ts` and the clock adapter.
- Gaps are never red or punishing. Streak breaks never move the timeline.

## 2. SOLID

**S: Single Responsibility**
- One reason to change per module. Core computes, repositories query, adapters talk to native APIs, services orchestrate, components render.
- A component that fetches, computes and renders is wrong. Split it.

**O: Open/Closed**
- Extend by adding, not editing. A new day status, milestone rule or glow level should require adding a case in one place (a map/table), not editing logic across files.
- Prefer lookup tables and strategy functions over growing `if/else` or `switch` chains.

**L: Liskov Substitution**
- Anything that implements a port (repository, clock, widget, notifications) must be swappable with a fake or no-op without behavior surprises. No implementation may throw where the port promises a result.

**I: Interface Segregation**
- Small, focused interfaces and props. Components receive only what they use, not whole entities or stores.
- No `IEverythingService`. Ports are split by capability (`JourneyRepo`, `CompletionRepo`, `ClockPort`, `WidgetPort`, `NotificationPort`, `SystemSettingsPort`).

**D: Dependency Inversion**
- Port interfaces live in `core/ports.ts`. Services receive repositories and platform adapters as parameters (via `createServices(deps)`), never by importing concrete modules inside.
- `core/` depends on nothing. Services depend on ports. UI depends on view-model hooks.

## 3. Other principles

- **DRY**: no duplicated logic. Repeated twice means extract; do not abstract before the second use.
- **KISS / YAGNI**: simplest thing that satisfies the doc. No unused parameters, flags or "future" hooks.
- **Separation of concerns**: follow the layering in `architecture.md` section 2. Imports only flow downward.
- **Law of Demeter**: no `a.b.c.d` chains across modules; expose a function instead.
- **Composition over inheritance**: no class hierarchies. Use functions and composition.
- **Pure functions first**: side effects only in `services/`, `db/`, `platform/`, `widget/` and UI.
- **Immutability**: never mutate arguments, state or store objects. Return new values.
- **Fail fast, handle at the edges**: validate input at boundaries (forms, import), then trust typed data inside.
- **Principle of least surprise**: names say what a thing does; functions do only that.

## 4. Layer import rules

```
app/, components/  →  hooks/, stores/ (read), services/ (actions), theme/, core/ (types only)
hooks/             →  stores/, core/
stores/            →  core/ (types), no services
services/          →  core/ (logic + ports), other services (sparingly). Never db/ or platform/ directly
db/repos/          →  db/schema, core/ (types + ports)
platform/          →  core/ports, native libraries (lazy)
core/              →  nothing except date-fns, @umalqura/core
widget/            →  core/, services (via factory), db/repos/, react-native-android-widget
index.ts, app/_layout.tsx (composition roots) →  may wire repos + platform into services
```

Forbidden:
- UI importing `db/`, `platform/` or `expo-sqlite`.
- Repositories containing business rules.
- `core/` importing React, Expo, Drizzle or Zustand.
- Circular imports between services (use a lower-level function instead).
- Components calling `Date.now()`, `new Date()` or reading settings directly.

## 5. Expo Go and native features

- **Every native-only feature goes through a port in `platform/`.** `expo-notifications`, `react-native-android-widget` and `expo-intent-launcher` are imported **only** inside `platform/` (and `widget/`, which is itself loaded only outside Expo Go).
- Native libraries are loaded with a **lazy `require()` inside functions**, never top-level imports, so Expo Go never evaluates a missing native module.
- In Expo Go (`Constants.executionEnvironment === 'storeClient'`) `platform/index.ts` returns **no-op adapters**. The app must never crash or show errors because a native feature is missing; the UI shows "Available in the installed app" where relevant.
- Do not add `expo-dev-client`, EAS config or any dev-build tooling.
- Never rely on Expo Go to verify the widget, reminders or performance. Those are verified on the CI-built APK at the build-plan gates.

## 6. TypeScript rules

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride`, `exactOptionalPropertyTypes` where practical.
- **No `any`.** Use `unknown` and narrow. No `@ts-ignore`; `@ts-expect-error` only with a comment explaining why.
- No non-null assertions (`!`) except in tests.
- Prefer `type` for data shapes and unions, `interface` for ports and contracts to be implemented.
- Use discriminated unions for states (e.g. `DayStatus`) and `Result` types for service outcomes:
  `type Result<T = void> = { ok: true; value: T } | { ok: false; reason: ErrorReason }`.
- No `enum`; use `as const` objects and union types.
- Export only what is used elsewhere. One default export per screen file (Expo Router), named exports everywhere else.
- Brand/alias IDs where useful (`type JourneyId = string & { __brand: 'JourneyId' }`).
- Zod schemas are the source of validation; infer types from them (`z.infer`).

## 7. Naming and style

- Files: `camelCase.ts` for modules, `PascalCase.tsx` for components, `useThing.ts` for hooks, `*.test.ts` for tests.
- Functions: verbs (`computeStreak`, `toggleTask`). Booleans: `is/has/can/should`. No abbreviations except common ones (`id`, `db`, `ui`).
- Constants: `UPPER_SNAKE_CASE` for true constants; theme tokens via the theme objects, never hardcoded.
- No magic numbers or strings: name them in `core/constants.ts` (e.g. `MILESTONE_INTERVAL = 10`, glow thresholds).
- Functions: max ~30 lines, max 3 parameters (options object beyond that), one level of abstraction, early returns over nesting, max nesting depth 3.
- Files: max ~250 lines. Split when larger.
- Comments explain **why**, not what. No commented-out code. No TODOs without a doc reference.
- Prettier + ESLint are law; code must pass `npm run lint` and `npm run typecheck` with zero warnings.

## 8. React / React Native rules

- Function components and hooks only.
- Components are presentational: props in, UI out. Logic lives in view-model hooks and core functions.
- One component per file; keep under ~150 lines. Extract subcomponents.
- Select the smallest slice from Zustand (`useStore(s => s.x)`); never subscribe to the whole store.
- Memoize derived data with `useMemo`; use `React.memo` / `useCallback` for list items and anything rendered in bulk (e.g. day circles).
- Lists use `FlatList` with stable `keyExtractor`, `getItemLayout` where rows are fixed height, and no heavy inline functions in `renderItem`.
- No logic in JSX beyond simple conditionals. No inline styles for tokens; use `StyleSheet.create` with theme values.
- Effects: only for syncing with the outside world (listeners, timers). Always clean up. Never use an effect to derive state.
- Animations: Reanimated, animating only `transform` and `opacity`, running on the UI thread; respect the system "reduce motion" setting; no animation logic in core.
- Accessibility: every touchable has `accessibilityRole` and `accessibilityLabel`; state is never conveyed by color alone; support font scale.
- Never hardcode strings that repeat; centralize copy in `copy.ts`.

## 9. Data and persistence rules

- All DB access goes through repositories. All writes go through services.
- Multi-row writes use transactions.
- Migrations are generated by `drizzle-kit`; never edit an applied migration. Add a new one.
- Never store derived values (no `sealedAt`-style flags). Never store a date where a dayNumber is the identity.
- Repositories return plain typed objects, not Drizzle internals.
- Every service write ends with `afterWrite()` (widget refresh + notification refresh). Do not copy-paste those calls.
- The app store is **reloaded from the database on every foreground**; the widget writes from a separate JS context.
- Backup import must validate with Zod before touching the DB, and replace data atomically.

## 10. Error handling and logging

- Services return `Result`; they do not throw for expected failures (validation, locked day, missing task).
- Throw only for programmer errors and unrecoverable states; catch at boundaries (error boundary, widget handler, notification handler).
- Never swallow errors silently. Log through `services/logger.ts` (ring buffer shown on the Diagnostics screen). No `console.log` in committed code.
- Never log user content (task titles, reasons, notes).
- User-facing messages are short and calm; never blame or use red for missed days.
- The widget handler must never crash: wrap in try/catch and fall back to the last good snapshot.

## 11. Performance and platform (budget Motorola)

- Cold start under 2 s and tick feedback under 100 ms **on the release APK** (never judge speed in Expo Go or a debug build).
- Follow the performance budget in `design-system.md`: no Lottie, no particle systems, no animated blur or shadows, at most one looping animation per screen, no per-circle gradients in the day grid.
- No heavy work on the JS thread during interactions. No unnecessary re-renders; no creating objects/arrays in render when passed to memoized children.
- Load everything into memory at startup (data is tiny); no per-screen DB queries.
- Respect Android specifics: notification channel, Android 13 permission, exact alarms, battery restrictions, adaptive icon.
- Pin dependency versions; always install with `npx expo install`; run `npx expo install --check` after changes.
- No new dependency without a stated reason and approval. Prefer the standard library, `date-fns` and the chosen stack. Watch APK size (target under ~40 MB).

## 12. Security and privacy

- No network requests, analytics, crash reporters or third-party SDKs that send data.
- No secrets in the repo. Signing material lives only in GitHub secrets (`ci-setup.md`). Never commit a keystore or print secrets in workflows.
- No logging of user content in production.
- Validate all imported data. Treat backup files as untrusted input.

## 13. Testing rules

- **Jest (`jest-expo`)** for all tests.
- **Core logic must have unit tests** with every change. Cover the PRD edge cases: gaps, mid-journey task changes, Hijri boundaries and adjustment, journey ending today, no make-up tasks, seal-event detection.
- Services are tested with in-memory **fake repositories and ports** and a fake clock.
- Test behavior, not implementation. One assertion focus per test; descriptive names (`it('breaks the streak after a gap but keeps dates unchanged')`).
- No flaky tests: never depend on the real clock or random data.
- A change is not done until `npm run test`, `npm run lint`, `npm run typecheck` all pass (CI runs the same three).
- Bug fix = failing test first, then the fix.

## 14. Git and workflow

- Small commits. Format: `type(scope): summary` (e.g. `feat(core): add streak calculation`), types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- One build-plan step per branch/commit group; commit at each checkpoint so it can be rolled back.
- Never commit with failing tests, lint or typecheck.
- Do not reformat or refactor unrelated files in a feature commit.
- CI builds are manual (workflow dispatch) or on version tags. Do not add triggers that run on every push.

## 15. How the agent must work

Before coding:
1. Re-read the relevant docs and state which requirement IDs (FR-x) the task covers.
2. List the files to create or change.
3. If anything is ambiguous or conflicts with the docs, ask. Don't guess.

While coding:
- Make the smallest change that satisfies the requirement.
- Write or update tests with the code, not after.
- Reuse existing functions; search before creating new ones.
- Keep the layering rules; if a change seems to need a violation, stop and propose an alternative.

After coding, report:
- Files created/changed
- Requirements covered (FR IDs)
- Tests added/updated, and results of test, lint, typecheck
- How to verify manually (the checkpoint from the build plan) and whether an **APK gate** is due
- Any deviations, assumptions or open questions

## 16. Definition of done

- [ ] Matches the docs (PRD, screens, data model, design system)
- [ ] Layer and import rules respected; SOLID applied
- [ ] No `any`, no magic values, no duplicated logic, no dead code
- [ ] Tests written and passing; `lint` and `typecheck` clean
- [ ] Runs in Expo Go without crashing (native features degrade through no-op adapters)
- [ ] Accessibility and reduce-motion handled for UI changes
- [ ] Performance budget respected
- [ ] No derived data stored; dayNumber identity preserved
- [ ] Widget and notifications still refresh after the change (if data is written)
- [ ] Build-plan checkpoint verified
- [ ] Committed with a proper message

## 17. Never do this

- Never reset a streak by changing dates, or shift a timeline.
- Never edit past days (except gap reasons and make-up tasks via the allowed flow).
- Never show gaps in red or with failure language.
- Never use `new Date()` directly outside `core/dates.ts` and the clock adapter.
- Never import `expo-notifications`, `react-native-android-widget` or `expo-intent-launcher` outside `platform/` and `widget/`.
- Never put business logic in components or repositories.
- Never add Lottie, `expo-dev-client`, EAS config or any paid or networked service.
- Never commit `android/`, a keystore, or any secret.
- Never install a package or change architecture without approval.
- Never skip tests "to save time".
