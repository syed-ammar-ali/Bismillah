# CI Setup: Free APK Builds with GitHub Actions

Goal: build a signed release APK of **Bismillah** on GitHub's servers, for free, with no Android Studio and no Java on your laptop.

Companion docs: `architecture.md` (section 14), `build-plan.md` (Step 0 and the APK gates).

---

## 1. How it works

```
You push code  →  GitHub Actions runner (Ubuntu, free)
                   1. npm ci, typecheck, lint, tests
                   2. expo prebuild (generates the android/ folder)
                   3. gradlew assembleRelease (arm + arm64 only)
                   4. re-sign the APK with YOUR keystore (apksigner)
                   5. upload bismillah.apk as a downloadable artifact
You download the APK  →  install on the Motorola
```

- The `android/` folder is **generated, never committed** (add `android/` and `ios/` to `.gitignore`).
- Everything the build needs is open source and free.
- Expo Go stays your day-to-day tool. The APK is only for widget, notification and speed checks, and for final daily use.

## 2. Free-tier limits (verify before relying on them)

- Keep the repo **private**. The keystore artifact in section 4 must never be public.
- GitHub Free currently gives private repos a monthly allowance of Linux minutes (2,000 at the time of writing). A build takes roughly 10 to 20 minutes with caching, so the allowance covers dozens of builds per month. Check *Settings > Billing and plans* on GitHub for the real numbers.
- Don't run the build on every push. It runs **manually** (button) or on a version tag, to save minutes.

## 3. Prerequisites (one-time, free)

1. A GitHub account and a **private** repository (e.g. `bismillah`).
2. Git and Node LTS on your laptop (you already have these for Expo Go).
3. Nothing else. No Java, no Android SDK locally.

## 4. One-time signing key setup

Why: every APK you install must be signed with the **same key**, or Android refuses to update it in place and you'd have to uninstall (which **wipes your data**). The key is created once and kept forever.

**Steps**
1. In the GitHub repo: *Settings > Secrets and variables > Actions > New repository secret*. Add:
   - `KEYSTORE_PASSWORD`: a strong password you choose (save it in your password manager).
   - `KEY_ALIAS`: `bismillah`
2. Add the workflow `generate-keystore.yml` (section 6.1), push it, then run it from the *Actions* tab ("Generate keystore", "Run workflow").
3. When it finishes, download the artifact `bismillah-keystore` (zip). It contains `bismillah.keystore` and `bismillah.keystore.b64`.
4. Open `bismillah.keystore.b64`, copy its whole content, and add a third secret: `KEYSTORE_BASE64`.
5. **Back up** `bismillah.keystore` and the password somewhere safe outside GitHub (e.g. Google Drive, your password manager). If you lose them you can never update the installed app in place.
6. **Delete the artifact** (Actions run > artifact > delete) and **delete `generate-keystore.yml`** from the repo.

## 5. Build and install flow

1. Actions tab > "Build APK" > Run workflow.
2. Wait for it to finish (roughly 10 to 20 minutes).
3. Download the artifact `bismillah-apk` (zip), unzip, and get `bismillah.apk` onto the phone (download directly on the phone, or USB / Google Drive).
4. First install: allow "Install unknown apps" for your browser or file manager. If Play Protect warns, choose "Install anyway".
5. Later builds install **over** the old app and keep all data (same key + higher version code).
6. After first install: allow notifications, allow exact alarms if offered, set the app's battery to **Unrestricted**, add the widget.

**Version code:** `app.config.ts` reads `VERSION_CODE` from the environment; the workflow sets it to the run number, so every build is higher than the last.

## 6. Workflow files

### 6.1 `.github/workflows/generate-keystore.yml` (run once, then delete)

```yaml
name: Generate keystore

on:
  workflow_dispatch:

jobs:
  keystore:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Generate keystore
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
        run: |
          keytool -genkeypair -v \
            -storetype PKCS12 \
            -keystore bismillah.keystore \
            -alias "$KEY_ALIAS" \
            -keyalg RSA -keysize 2048 -validity 10000 \
            -storepass "$KEYSTORE_PASSWORD" \
            -keypass "$KEYSTORE_PASSWORD" \
            -dname "CN=Bismillah, O=Personal, C=IN"
          base64 -w0 bismillah.keystore > bismillah.keystore.b64

      - uses: actions/upload-artifact@v4
        with:
          name: bismillah-keystore
          path: |
            bismillah.keystore
            bismillah.keystore.b64
          retention-days: 1
```

PKCS12 keystores use one password for both store and key, so a single `KEYSTORE_PASSWORD` is used throughout.

### 6.2 `.github/workflows/build-apk.yml`

```yaml
name: Build APK

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'

concurrency:
  group: build-apk
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      VERSION_CODE: ${{ github.run_number }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Install dependencies
        run: npm ci

      - name: Typecheck, lint, test
        run: |
          npm run typecheck
          npm run lint
          npm test -- --ci

      - name: Generate native Android project
        run: npx expo prebuild --platform android --clean --no-install

      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ runner.os }}-${{ hashFiles('package-lock.json', 'app.config.ts') }}
          restore-keys: gradle-${{ runner.os }}-

      - name: Build release APK
        working-directory: android
        run: ./gradlew assembleRelease --no-daemon -PreactNativeArchitectures=armeabi-v7a,arm64-v8a

      - name: Sign APK
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 -d > "$RUNNER_TEMP/release.keystore"
          BUILD_TOOLS=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -n 1)
          "$BUILD_TOOLS/apksigner" sign \
            --ks "$RUNNER_TEMP/release.keystore" \
            --ks-key-alias "$KEY_ALIAS" \
            --ks-pass env:KEYSTORE_PASSWORD \
            --key-pass env:KEYSTORE_PASSWORD \
            --out bismillah.apk \
            android/app/build/outputs/apk/release/app-release.apk
          "$BUILD_TOOLS/apksigner" verify --print-certs bismillah.apk
          rm -f "$RUNNER_TEMP/release.keystore"

      - uses: actions/upload-artifact@v4
        with:
          name: bismillah-apk
          path: bismillah.apk
          retention-days: 30
```

Notes for whoever implements this:
- `apksigner verify --print-certs` prints the signing certificate's SHA-256. **It must be identical on every build.** Record it after the first build; a changed value means the wrong key was used.
- The generated Expo project signs release builds with the debug key by default. The Sign step replaces that signature with yours. If `apksigner` ever refuses to re-sign, fall back to a config plugin that sets a release `signingConfig` in `build.gradle` from environment variables.
- Keep Node, Java and Gradle versions aligned with the installed Expo SDK's requirements (check the Expo SDK release notes when the SDK changes). Java 17 and Node 20 are the starting point.
- Never print secrets. Do not add `set -x` to the signing step.

## 7. `app.config.ts` essentials

```ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Bismillah',
  slug: 'bismillah',
  scheme: 'bismillah',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  android: {
    package: 'com.bismillah.app',
    versionCode: Number(process.env.VERSION_CODE ?? 1),
    permissions: [
      'POST_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-sqlite',
    'expo-notifications',
    ['expo-build-properties', { android: { /* tune per SDK docs */ } }],
    // react-native-android-widget plugin with the two widget definitions
    // (small 2x2 and medium 4x2, updatePeriodMillis 1800000), see architecture.md section 9
  ],
};

export default config;
```

The widget plugin entry is filled in during build-plan Step 0 using the library's current documentation.

## 8. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Build fails at typecheck, lint or tests | Fix locally first. The same commands run in CI |
| Build fails in Gradle with out-of-memory | Add `org.gradle.jvmargs=-Xmx4g` via the `expo-build-properties` plugin or `gradle.properties` step |
| "App not installed" on phone | Older version signed with a different key, or version code not higher. Uninstall once (export a backup first), then install |
| `apksigner: command not found` | Build-tools path differs. List `$ANDROID_HOME/build-tools` in the workflow and adjust |
| Signing step fails to decode keystore | `KEYSTORE_BASE64` was pasted with line breaks or missing characters. Re-copy from the `.b64` file |
| Widget missing in the widget picker | Widget plugin not applied during prebuild. Check the `plugins` entry and the generated `AndroidManifest.xml` |
| Notifications silent after reboot or hours | Battery set to Optimized. Set to Unrestricted. On Motorola: Settings > Apps > Bismillah > Battery |
| No logs on the phone | Use the in-app Diagnostics screen (Settings > About > Diagnostics) |

## 9. Fallbacks if GitHub minutes ever run out

1. Wait for the monthly reset. Expo Go keeps working meanwhile.
2. Make the repository public **after** confirming it contains no secrets (the keystore workflow is already deleted and secrets live only in GitHub secrets). Public repos have free minutes, but never re-run the keystore workflow while public.
3. Expo's own cloud build service (EAS) has a free tier with limited builds per month; usable as a backup route.
