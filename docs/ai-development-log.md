# AI Development Log

### 2026-09-14 — Final reminder and attachment reliability correction

- Removed draft thumbnails immediately on attachment removal, while temporary
  file cleanup continues independently outside the React state updater.
- Exhaustively handled every post-commit reminder scheduling result; permission
  and development-build failures now leave the saved capture without reminder
  metadata and report that honestly. Committed image files are never removed.
- Replaced two corrupted comment dash sequences with plain hyphens.

### 2026-09-14 — Capture persistence reliability correction

- Capture and image inserts now use one Expo SQLite exclusive transaction.
- Pre-commit image files are compensated on processing or database failure;
  after commit, permanent files belong to the saved capture and are not removed
  for reminder failures.
- Successful notification scheduling is canceled if reminder metadata cannot be
  persisted. Expo Go now reports that no reminder was added when a development
  build is required.
- Temporary cache files are cleaned when removed and after successful commit;
  Inbox image metadata now includes spacing around the middle dot.
- The product owner physically verified the approved Android 12-hour AM/PM
  picker on 2026-09-14. Notification delivery in a development build remains
  unverified.

### 2026-09-13 — Android picker responsiveness correction

- **Implementation correction:** The Compose/SwiftUI icon bridge was removed
  from React Native `Pressable`s. Toolbar icons now use Lucide through
  `react-native-svg`.
- **Launch correction:** Media launch locking now uses a ref, avoiding a
  pre-launch render. Pending camera-result recovery runs once on screen mount
  instead of during the immediate camera press path.
- **Verification status:** Physical one-tap verification remains pending until
  the Android checklist is tested.
- **Reminder time presentation:** The Android time control changed from the
  Material clock-face picker to its compact 24-hour input variant.
- **Reminder time correction:** The documented input variant does not affect
  the installed Android inline time implementation; the circular Material
  clock was replaced with validated React Native hour/minute inputs and AM/PM
  selection. The earlier 24-hour input was superseded by the approved AM/PM
  design.

### 2026-09-13 — Earlier picker responsiveness correction

- **Correction:** Removed the earlier `Keyboard.dismiss()` calls immediately
  before opening the camera and Files picker. `Keyboard.dismiss()` initiates a
  separate native keyboard transition, while the camera and document picker
  launch separate Android activities; starting both transitions together was
  unnecessary and may have contributed to perceived unresponsiveness.
- **Error handling:** Document-picker exceptions are no longer converted into
  cancellation. Camera and Files launch failures are logged with their real
  development error and shown to the user with short non-technical alerts.
  Cancellation remains a normal `null` result, and the acquisition guard is
  reset in `finally`.
- **Touch target:** Added invisible `hitSlop={8}` to the reminder, camera, and
  attachment controls without changing their visual layout, icon size, or
  single-operation guard.
- **Verification:** The requested TypeScript, whitespace, status, and focused
  diff checks are recorded for this correction after implementation. Physical
  Android testing is still required; responsiveness is not claimed fixed until
  the specified keyboard-open, cancellation, and rapid-tap checklist is
  completed. Any Alert or terminal error observed during that test should be
  recorded verbatim.

### 2026-09-13 — Composer toolbar correction

- **Cause of the missing reminder label:** `composer-toolbar.tsx` rendered its
  label only when `reminderAt` was non-null, so the bell had no visible
  `Set reminder` text in the default state.
- **Cause of unreliable camera, attachment, and reminder taps:** the native
  icon bridge rendered views inside the surrounding React Native controls,
  creating a mixed interaction boundary. The toolbar now uses decorative
  Lucide SVG icons so the surrounding `Pressable` owns the interaction.
- **Attachment decision:** the paperclip now launches the system Files/document
  picker directly with `type: "image/*"` and
  `copyToCacheDirectory: true`; the intermediate Gallery/Files choice was
  removed. Camera and document-picker handlers launch directly while the
  existing acquisition guard prevents duplicate picker opens.
- **Verification performed:** TypeScript was checked with `npx tsc --noEmit`;
  whitespace was checked with `git diff --check`; repository searches confirmed
  the reminder label is unconditional, the media-choice component has no
  references, the paperclip is wired directly to the document picker, native
  icon content uses `pointerEvents="none"`, and the protected Inbox CTA is
  unchanged. Dependency manifests and the lockfile were not changed by this
  correction.
- **Physical-device confirmation still required:** Android Expo Go checks for
  the visible label, single-tap reminder/camera/Files behavior, image-only
  Files results, cancellation, image preview insertion, and rapid-tap
  duplicate-picker prevention. No device behavior is claimed as verified here.

### 2026-09-13 — Approved Composer/Media/Reminder Vertical Slice (corrected)

- **Date:** 2026-09-13
- **Milestone:** Implement complete media capture, image processing, draft management, and local reminders in the New Capture composer.
- **Requested scope:** Full-featured text and image composer with image processing, durable storage, SQLite integration, local reminders, and updated Inbox display (Concept B).
- **Actual files changed (first pass, then corrected same day):**
  - Database: `src/data/database.ts` (migration v1→v2, image table, reminder fields)
  - Domain types: `src/features/captures/capture.ts` (image types, reminder fields)
  - Repository: `src/features/captures/capture-repository.ts` (create capture with images, list with images)
  - New modules: `src/features/images/image-processor.ts`, `src/features/images/image-acquisition.ts`, `src/features/notifications/notification-service.ts`, `src/features/reminders/reminder-utils.ts` (added in correction), `src/hooks/useDraftAttachments.ts`
  - Composer components: `src/components/composer/composer-toolbar.tsx`, `src/components/composer/attachment-preview-rail.tsx`, `src/components/composer/reminder-sheet.tsx`, `src/components/composer/media-picker-choice.tsx`
  - New UI component: `src/components/ui/stow-icon.tsx` (added in correction)
  - Routes: `src/app/capture.tsx`, `src/app/index.tsx`
  - Config: `app.json`
  - Documentation: `docs/product-requirements.md`, `docs/ai-development-log.md`
- **Dependencies:** `expo-image-picker@~57.0.17`, `expo-image-manipulator@~57.0.17`, `expo-file-system@~57.0.7`, `expo-document-picker@~57.0.2`, and `expo-notifications@~57.0.18`
- **Mistakes and corrections (first pass, corrected in second pass same day):**
  - **Expo Go import crash (root cause):** `notification-service.ts` had a top-level `import * as Notifications from "expo-notifications"` and called `Notifications.setNotificationHandler()` at module scope. Expo SDK 57 on Android Expo Go crashes during module evaluation when `expo-notifications` is statically imported. Because `capture.tsx` and `index.tsx` both imported from `notification-service.ts` (directly or transitively through `reminder-sheet.tsx`), neither route could be evaluated. The Expo Router then reported "missing default export" — a cascading error, not a real missing export.
  - **Fix:** Pure date utilities (`getDefaultReminderTime`, `formatReminderTime`) moved to a new `src/features/reminders/reminder-utils.ts` with no expo-notifications dependency. `notification-service.ts` now uses `isRunningInExpoGo()` from `expo` and dynamically imports `expo-notifications` only when confirmed not in Expo Go. Handler and channel initialization is lazy and idempotent.
  - **Expo Go reminder behavior:** In Expo Go, tapping "Set reminder" opens the sheet for visual testing, but confirming shows an honest alert that notification delivery requires a development build. No fake notification ID is stored. The capture can still be saved without a reminder.
  - **Fake capture ID 0:** First pass called `scheduleReminder(0, ...)` before capture creation. Corrected to schedule the notification only after `createCapture()` returns the real capture ID, then persist the notification ID via `updateCaptureReminder()`.
  - **Placeholder calendar:** First pass used manual +/- hour and minute incrementers with a "Date selection coming in next iteration" label. Replaced with `DateTimePicker` from `@expo/ui/jetpack-compose` for both date and time selection on Android.
  - **Emoji icons:** First pass used emoji (bell, camera, paperclip) as toolbar icons. Replaced with a platform-aware native icon component.
  - **Render-time BackHandler:** First pass registered the BackHandler inside a `useState` initializer (render-time side effect). Replaced with a `useFocusEffect` that always removes the subscription on blur/unmount and reads current draft state via a ref.
  - **`placeholderTextColor="var(--foreground-muted)"`:** CSS variable strings cannot be used as React Native native color props. Replaced with `colors["foreground-muted"]` from `useCssVariables()`, which returns the correct hex value for the current theme.
  - **`active:bg-danger-pressed`:** Not a locked semantic token. Replaced with `active:opacity-80`.
  - **Missing asset `notification-sound.wav`:** First pass referenced `./assets/notification-sound.wav` in `app.json`. The file does not exist. Removed the custom sound declaration; default system notification sound is used.
  - **`microphonePermission` missing:** Added `"microphonePermission": false` to the `expo-image-picker` plugin config. Stow captures still images and must not request audio-recording permission.
  - **Deprecated `manipulateAsync`:** First pass used `ImageManipulator.manipulateAsync()` which is deprecated in SDK 57. Replaced with the modern contextual API: `ImageManipulator.manipulate(source)` → `.resize(...)` → `.renderAsync()` → `.saveAsync({...})`.
  - **Legacy FileSystem API:** First pass mixed modern `Paths` with legacy functional calls (`copyAsync`, `moveAsync`, `deleteAsync`, `getInfoAsync`, `makeDirectoryAsync`). In SDK 57, the legacy functions must be imported from `expo-file-system/legacy`; importing them from `expo-file-system` directly throws at runtime. Replaced throughout with the modern OO API (`File`, `Directory`, `Paths`).
  - **Backdrop dismissal bug:** First pass put `onTouchEnd={onDismiss}` on the outer reminder sheet wrapper, which caused the sheet to dismiss when the user interacted with pickers inside it. Fixed by using a separate `Pressable` backdrop layer with absolute positioning, leaving the sheet `View` with `pointerEvents="box-none"`.
  - **Sheet state not resetting:** First pass only reset state when `currentReminder` changed; the sheet could show stale state when reopened. Corrected to reset to the initial date on every open by keying the reset on `visible`.
  - **Notification trigger type:** First pass used `SchedulableTriggerInputTypes.TIME_INTERVAL` (seconds from now). Replaced with `SchedulableTriggerInputTypes.DATE` with a `Date` object for accurate one-time future scheduling per SDK 57 docs.
  - **`SCHEDULE_EXACT_ALARM`:** Retained in `app.json`. The `DateTriggerInput` type schedules exact alarms on Android; `SCHEDULE_EXACT_ALARM` is required on Android 12+ for exact delivery. Affects standalone and development binaries; Expo Go host app already holds this permission.
  - **Atomic failure rollback:** First pass left orphan image files on disk if `createCapture` failed after some images had been stored. Corrected: stored URIs are collected and deleted on any error before the save transaction completes.
  - **Reminder lifecycle corrected:** Draft reminder is now just a timestamp in composer state. No notification is scheduled until after `createCapture()` returns the real capture ID. If notification scheduling subsequently fails, the capture is kept and reminder fields are cleared so the Inbox never shows a false reminder.
- **Decisions and reasoning:**
  - Database schema: Separate `capture_images` table with foreign key `ON DELETE CASCADE` preserves normalization and ensures image metadata is cleaned up with the capture
  - Image processing: Modern contextual API chains operations before a single render call; quality 0.82 balances size and visual quality; JPEG throughout; no EXIF, no base64
  - File storage: Modern OO FileSystem API (`File`, `Directory`, `Paths`) throughout; collision-safe filenames; temp files cleaned on remove, discard, or failure; permanent files not deleted on success
  - `isRunningInExpoGo()` from `expo` package is the documented supported API for capability guarding
  - `formatReminderTime` and `getDefaultReminderTime` in a standalone module so UI components have no notifications dependency
  - `useCssVariables` hook provides hex values for native props (notification channel `lightColor`, icon `tint`/`color`) without duplicating palette throughout components
- **Documentation consulted:** Expo SDK 57 (ImageManipulator contextual API, FileSystem OO API, ImagePicker, DocumentPicker, Notifications trigger types and channel setup), Expo UI DateTimePicker props, React Native 0.86 BackHandler, and useFocusEffect
- **Verification (after corrections):**
  - `npx tsc --noEmit` passed
  - `git diff --check` passed (CRLF warnings only, pre-existing)
  - No static `expo-notifications` imports outside `notification-service.ts`
  - No `captureId: 0` in notification scheduling code
  - No `manipulateAsync`
  - No `notification-sound.wav`
  - No `danger-pressed`
  - No `placeholderTextColor="var(...)"`
  - No placeholder calendar text
  - No emoji icons in source
  - No render-time BackHandler registration
  - Protected `+ New capture` Text block byte-for-byte unchanged
  - Both route files have valid `export default` components
- **Remaining unverified — physical Android Expo Go device checks:**
  - Composer loads without route-export or ErrorBoundary warnings
  - Text capture saves and appears in Inbox (basic regression)
  - Camera permission request and photo capture flow
  - Gallery permission and multiple image selection
  - Document picker file selection
  - Attachment rail thumbnails render correctly
  - Remove-image closes correctly and thumbnail disappears
  - Discard confirmation triggers on Cancel and hardware back when draft has content
  - Untouched draft closes without confirmation
  - Reminder sheet opens and closes without dismissing on internal interaction
  - Reminder time summary shows in accent purple in toolbar and Inbox
  - Expo Go reminder alert appears with honest explanation (no fake schedule)
  - Image-only capture saves and renders in Inbox
  - Text + images capture renders with thumbnail
  - Separator and +N overlay on multi-image captures
  - Dark-mode and light-mode color correctness throughout composer
- **Remaining unverified — development build only:**
  - Notification permission request fires when user confirms reminder
  - Notification is delivered at the scheduled time
  - Notification ID is persisted and cancelable
  - `SCHEDULE_EXACT_ALARM` behavior on Android 12+ devices

### 2026-09-12 — Locked Populated Inbox v1

- **Date:** 2026-09-12
- **Milestone:** Implement the locked populated Inbox design.
- **Requested scope:** Visual refinement of the populated state into a flat editorial list, preserving existing functionality and the bottom action area.
- **Actual files changed:**
  - `docs/product-requirements.md`: Added `Approved Populated Inbox v1` section.
  - `src/app/index.tsx`: Refactored `FlatList` and row design.
  - `docs/ai-development-log.md`: This entry.
- **Dependencies:** Unchanged.
- **Decisions and reasoning:**
  - Used `ItemSeparatorComponent` in `FlatList` to ensure dividers only appear between items, as requested.
  - Rows use variable heights to accommodate natural text wrapping; `getItemLayout` was omitted for this reason.
  - `numberOfLines={3}` and `ellipsizeMode="tail"` were used for the capture preview to meet the three-line constraint.
  - Applied semantic tokens (`text-foreground`, `text-foreground-muted`, `border`) and Inter weights (`font-sans-medium`, `font-sans`) as per the visual contract.
  - Preserved the bottom action area exactly as requested, including the `font-sans-lg` class.
- **Documentation consulted:** Expo SDK 57, React Native 0.86 `FlatList` and `Text`, Uniwind class names.
- **Verification:**
  - `npx tsc --noEmit` passed.
  - `git diff --check` passed.
  - Physical Android Expo Go dark-mode verification confirmed:
    - Header and header divider rendered correctly.
    - Two single-line populated rows displayed without wrapping.
    - Semantic dark colors applied accurately.
    - Metadata hierarchy (capture text and `Unsorted` label) visibly distinct.
    - One between-row separator present; no separator above first row or below final row.
    - Bottom action area rendering preserved.
  - Physical Android Expo Go verification completed on 2026-09-13:
    - Long captures display a maximum of three lines with no text shrinkage.
    - Content beyond the third line receives a trailing ellipsis.
    - Variable-height rows expand correctly around longer text.
    - Row separators reposition correctly as row height varies.
    - A sufficiently populated Inbox scrolls smoothly.
    - The header remains outside the scrolling list area.
    - The bottom New Capture action remains fixed, visible, and reachable during scroll.
    - The final list row has no separator beneath it.
    - Light-mode semantic colors applied correctly: background, foreground, muted foreground, border, and accent colors all render as designed.
    - Light status-bar region visually matches the screen.
    - Text remains readable in light mode.
- **Mistakes and corrections:** Stale TBD wording in `Approved Empty Inbox v1` ("Preserved" statement) found during review; corrected in product-requirements.md to reflect that populated Inbox design is now locked.
- **Technical debt / warnings:** The approved Populated Inbox v1 device-verification checklist is complete on Android. iOS visual verification remains future platform coverage.
- **Learning notes:** `ItemSeparatorComponent` is cleaner than conditional borders within `renderItem` for lists that shouldn't have top/bottom dividers.

### 2026-09-12 — Visible Inbox and text-capture slice

- **Date and requested scope:** 2026-09-12; implement the first visible Stow
  slice: active-capture Inbox, Expo Router New Capture modal, text-only save,
  newest-first refresh, and SQLite persistence across app reloads.
- **Files changed for this slice:** `docs/product-requirements.md`,
  `docs/ai-development-log.md`, `src/app/_layout.tsx`, `src/app/index.tsx`,
  `src/app/capture.tsx`, and `src/components/app-screen.tsx`. Existing
  uncommitted persistence files were preserved; no repository or schema
  changes were made.
- **Dependencies:** Unchanged for this visible slice. The existing
  `expo-sqlite@~57.0.3` persistence dependency and prior lockfile/config
  changes were preserved; no packages were installed, removed, or upgraded.
- **Documentation consulted:** Expo Router SDK 57, Expo Router modals, Expo
  SQLite SDK 57, Expo StatusBar SDK 57, Expo safe-area-context SDK 57, React
  Native 0.86 `TextInput`, `FlatList`, and `Pressable`, and Uniwind
  `withUniwind`, `TextInput`, `FlatList`, and `Pressable` documentation.
- **Behavior:** The Inbox explicitly handles loading, error/retry, empty, and
  populated states; it lists active captures newest-first and labels each
  capture `Unsorted`. New capture opens `/capture` as a dedicated modal.
  Whitespace-only drafts cannot be saved; successful text saves create an
  active `Unsorted` capture, dismiss the modal, and refetch the Inbox. Cancel,
  system back, and failed saves do not create a capture or discard a failed
  draft. No draft retention or discard confirmation was implemented.
- **Safe areas and status bar:** The final `AppScreen` uses a core React Native
  outer `View` for the semantic background and an inner
  `react-native-safe-area-context` `SafeAreaView` for inset padding. The root
  renders Expo `StatusBar` with `style="auto"`.
- **Startup sequencing:** Fonts resolve first; `SQLiteProvider.onInit` opens
  and migrates the database; only its child navigation component then mounts,
  hides the splash, and renders the Router stack. Font errors still allow the
  flow to continue so the splash cannot remain stuck.
- **Verification performed:** TypeScript and lint checks passed during feature
  implementation. Lockfile recovery later parsed and compared every record
  against `HEAD`: 663 committed records became 665, with only the root,
  `await-lock`, and `expo-sqlite` records differing or new.
- **Device verification:** Performed on Android Expo Go by the product owner:
  the Inbox populated, a text capture was created, the app was
  restarted/reloaded, and the capture remained stored as `Unsorted`. A
  screenshot confirms the populated Inbox and bottom action.
- **Exclusions:** No editing, classification controls, archive, delete,
  reminders, images, compression, autosave, discard confirmation, or network
  features were added.
- **Mistakes/corrections:** The first dependency-cleanup attempt accidentally
  reduced the lockfile to three package records and therefore failed. Recovery
  restored the complete committed dependency tree and added only the approved
  root `expo-sqlite` dependency plus `await-lock` and `expo-sqlite` package
  records. Earlier UI corrections also removed unchecked casts and fixed
  TextInput `accent-` color bindings.
- **Next step:** Android Expo Go persistence verification is complete; proceed
  only with the next separately approved product slice.

This log records factual AI-assisted work on Stow. It is not a substitute for
the Git history: it explains scope, reasoning, documentation, verification,
and corrections. Dates that cannot be established from the repository are
explicitly marked `TBD`.

## Repeatable entry template

Copy this structure for each AI-assisted milestone:

### YYYY-MM-DD — Milestone name

- **Date:**
- **Milestone:**
- **Requested scope:**
- **Actual files changed:**
- **Dependencies:** Added, removed, or unchanged; include the reason.
- **Decisions and reasoning:**
- **Documentation consulted:**
- **Verification:** Commands, device checks, and results. Mark pending checks
  explicitly.
- **Mistakes and corrections:**
- **Learning notes:**
- **Platform implications:**
- **Technical debt and next step:**

## Backfilled milestones

### TBD — Expo template cleanup and minimal Router baseline

- **Date:** `TBD` — the repository history records only the initial commit, not
  the date of this working-tree change.
- **Milestone:** Expo template cleanup and minimal Router baseline.
- **Requested scope:** Remove the generic starter surface and establish a small
  Stow-ready route baseline.
- **Actual files changed:** Removed the starter components, hooks, theme,
  additional route, reset script, and template image assets. Updated
  `src/app/_layout.tsx`, `src/app/index.tsx`, and `src/global.css`; renamed the
  package/app identity in `package.json` and `app.json` as part of the broader
  foundation diff.
- **Dependencies:** Existing Expo dependencies were retained; no dependency
  was added specifically for the cleanup step.
- **Decisions and reasoning:** Keep one `src/app/index.tsx` route and a simple
  `Stack` layout so feature architecture can be added incrementally.
- **Documentation consulted:** [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
  and [Expo Router SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/sdk/router/).
- **Verification:** Repository diff inspection confirms the template files are
  removed and the Router entry remains. Broader feature verification is not
  applicable; no product feature was implemented.
- **Mistakes and corrections:** No correction is evidenced for this milestone
  in the available Git history.
- **Learning notes:** Expo Router discovers routes from the configured route
  directory; the project uses `src/app`.
- **Platform implications:** The baseline remains a native Expo Router app for
  Android-first work with iOS compatibility.
- **Technical debt and next step:** The index route is a foundation screen,
  not a product flow. Define and approve the first capture step before building
  it.

### TBD — Quiet Indigo, Inter, and tucked-ribbon S decisions

- **Date:** `TBD` — historical date is not recorded.
- **Milestone:** Visual foundation decisions.
- **Requested scope:** Establish the initial Stow visual language and brand
  direction.
- **Actual files changed:** The current diff contains the Stow PNG/SVG brand
  assets and theme values in `src/global.css`; `app.json` records Stow identity,
  Quiet Indigo-related colors, and automatic appearance.
- **Dependencies:** No dependency change is attributable to the design
  decision alone.
- **Decisions and reasoning:** Quiet Indigo provides the locked accent
  direction; Inter is the typography direction; the tucked-ribbon `S` is the
  selected brand mark.
- **Documentation consulted:** Expo SDK 57 [app configuration reference](https://docs.expo.dev/versions/v57.0.0/config/app/)
  for icon, color, and automatic appearance configuration.
- **Verification:** Repository inspection confirms the named PNG/SVG asset
  variants and `userInterfaceStyle: "automatic"`. Visual approval history is
  not present in Git and is not claimed here.
- **Mistakes and corrections:** No correction is evidenced in the available
  repository history.
- **Learning notes:** Brand decisions must be recorded separately from
  implementation details so later UI work does not silently redefine them.
- **Platform implications:** Light/dark assets and theme values need checking
  on Android and iOS; native preview verification remains separate.
- **Technical debt and next step:** Exact design tokens and component rules are
  `TBD`; keep the approved visual direction stable while specifying them.

### TBD — Uniwind installation and theme configuration correction

- **Date:** `TBD` — historical date is not recorded.
- **Milestone:** Uniwind installation and initial theme setup.
- **Requested scope:** Add Uniwind styling and configure light/dark theme
  tokens for the foundation screen.
- **Actual files changed:** Added `tailwindcss` and `uniwind` to
  `package.json`/`package-lock.json`; added `metro.config.js`,
  `src/uniwind-types.d.ts`, and updated `src/global.css` and
  `src/app/_layout.tsx`.
- **Dependencies:** `tailwindcss` `^4.3.3` and `uniwind` `^1.12.0` were added.
- **Decisions and reasoning:** Use the Uniwind Metro wrapper and a CSS entry
  file; define light and dark background, foreground, and accent tokens and
  map Inter weights to utility font names.
- **Documentation consulted:** The repository's installed configuration and
  the Expo SDK 57 reference were checked; an external Uniwind-specific
  documentation URL is not recorded in the repository.
- **Verification:** The final tracked/untracked foundation files show the
  corrected Metro wrapper and generated type declaration. The initial theme
  configuration mistake and its correction are recorded because they were part
  of the requested history; exact intermediate content is not present in Git.
- **Mistakes and corrections:** The initial Uniwind theme configuration was
  incorrect; it was corrected to the final `light`/`dark` configuration in
  `src/global.css` and the generated Uniwind declaration.
- **Learning notes:** Styling configuration is bundler-sensitive; the Metro
  integration and CSS entry must agree.
- **Platform implications:** The theme configuration must resolve consistently
  on Android and iOS, with automatic system appearance.
- **Technical debt and next step:** Add focused styling verification when the
  first real product UI exists.

### TBD — PNG export and Stow app configuration

- **Date:** `TBD` — historical date is not recorded.
- **Milestone:** PNG asset export and Expo app configuration.
- **Requested scope:** Export Stow assets and configure the app identity, icon,
  adaptive icon, splash screens, and appearance.
- **Actual files changed:** Added `assets/images/stow-*.png` and matching SVG
  source assets; updated `app.json`; updated the lockfile as part of dependency
  synchronization in the foundation diff.
- **Dependencies:** PNG conversion used temporary
  `@resvg/resvg-js-cli` through `npx`; no permanent dependency was added.
  `expo-splash-screen` and existing Expo configuration support the settings.
- **Decisions and reasoning:** Configure Stow as the app name/slug, use the
  Stow icon and Android adaptive assets, set Quiet Indigo as the primary and
  adaptive background color, and provide light/dark splash image paths.
- **Documentation consulted:** Expo SDK 57 [app configuration reference](https://docs.expo.dev/versions/v57.0.0/config/app/),
  including icon, adaptive icon, splash plugin, and `userInterfaceStyle`.
- **Verification:** File and configuration inspection confirms the PNG paths
  referenced by `app.json` exist in the working tree. Preview-build
  verification for native icons and splash screens is **pending**; it is not
  claimed to have been performed in Expo Go.
- **Mistakes and corrections:** The initial configuration missed iOS handling,
  splash details, and the lockfile update; those corrections are represented by
  the final app configuration and current lockfile diff. Exact intermediate
  values are not recoverable from Git history.
- **Learning notes:** App-config changes can affect native output even when the
  JavaScript surface is unchanged; native assets need a build-level check.
- **Platform implications:** Android adaptive assets and iOS icon/splash output
  must be verified independently in a preview build.
- **Technical debt and next step:** Run the pending native preview-build check
  before treating icon and splash configuration as complete.

### TBD — Inter runtime loading and Expo Go verification

- **Date:** `TBD` — historical date is not recorded.
- **Milestone:** Inter 400/500/600 runtime loading.
- **Requested scope:** Load the approved Inter weights at runtime and verify the
  foundation in Expo Go.
- **Actual files changed:** Updated `src/app/_layout.tsx` to load
  `Inter_400Regular`, `Inter_500Medium`, and `Inter_600SemiBold` with
  `useFonts`, and updated `src/global.css` to map those font names to utility
  classes.
- **Dependencies:** Added `@expo-google-fonts/inter` `^0.4.2` and synchronized
  `package-lock.json`.
- **Decisions and reasoning:** Hold the splash screen until fonts load (or
  loading reports an error), then render the Router stack; this prevents the
  initial screen from rendering before its typography is available.
- **Documentation consulted:** The obsolete Expo SDK 57 custom fonts guide
  (`https://docs.expo.dev/versions/v57.0.0/guides/using-custom-fonts/`)
  returned 404 during this review. Valid references are the [Expo SDK 57
  Font](https://docs.expo.dev/versions/v57.0.0/sdk/font/) reference and the
  [current Fonts guide](https://docs.expo.dev/develop/user-interface/fonts/).
- **Verification:** The current source visibly contains all three font imports,
  `useFonts`, and the splash hide guard. Expo Go verification is recorded as
  completed in the milestone scope, but no separate device transcript exists in
  the repository. Native icon/splash preview verification remains pending.
- **Mistakes and corrections:** No additional correction is evidenced after
  the final runtime-loading implementation.
- **Learning notes:** Font loading is an app-start concern and should be kept
  next to splash-screen lifecycle handling.
- **Platform implications:** Runtime font loading applies to Android and iOS;
  verify weight rendering on both when device coverage expands.
- **Technical debt and next step:** Add a repeatable device verification record
  and test the first real UI with all approved weights.

### 2026-09-12 — Repository foundation documentation

- **Date:** `2026-09-12`.
- **Milestone:** Creation of the engineering constitution, product
  requirements, AI development log, and Stow README.
- **Requested scope:** Establish the repository's foundational product,
  engineering, and AI-work documentation.
- **Actual files changed:** Created the three documentation files
  `docs/engineering-constitution.md`, `docs/product-requirements.md`, and
  `docs/ai-development-log.md`. Updated/replaced the existing `README.md`;
  it was not created.
- **Dependencies:** Unchanged; no dependencies were added.
- **Decisions and reasoning:** Keep product requirements, engineering
  principles, and factual AI-work history in separate documents, with
  unresolved decisions explicitly marked `TBD`.
- **Documentation consulted:** Expo SDK 57 reference, Expo Router SDK 57
  reference, the [Expo SDK 57 Font](https://docs.expo.dev/versions/v57.0.0/sdk/font/)
  reference, and the [current Fonts guide](https://docs.expo.dev/develop/user-interface/fonts/).
- **Verification:** This was documentation-only, changed no runtime behavior,
  and was verified through repository inspection and Markdown-link checks.
- **Mistakes and corrections:** The first documentation draft introduced
  unapproved task-completion wording, used an obsolete font-documentation link,
  and omitted the temporary rasterization tool. These were corrected after
  review.
- **Learning notes:** Foundational documentation should distinguish approved
  behavior from unresolved product decisions.
- **Platform implications:** None; runtime platform behavior is unchanged.
- **Technical debt and next step:** Continue recording meaningful
  implementation or documentation steps in this log.

### 2026-09-12 — Text-capture persistence foundation (first slice)

- **Date:** 2026-09-12
- **Milestone:** Implement on-device persistence foundation for the approved
  first text-capture slice and record the decision and verification steps.
- **Requested scope:** Add SQLite-backed persistence (no UI capture or Inbox
  implementation) and wire the Router stack to `SQLiteProvider`. Install only
  `expo-sqlite` and record reasoning for avoiding an ORM.
- **Actual files changed:**
  - `app.json`
  - `package.json`
  - `package-lock.json`
  - `docs/product-requirements.md` (added the approved first capture slice,
    invariants, persistence decision, and dependency rule)
  - `docs/ai-development-log.md` (this milestone entry and corrections)
  - `src/app/_layout.tsx` (wrapped Router `Stack` with `SQLiteProvider` and
    passed the migration `onInit`)
  - `src/data/database.ts` (database migration + PRAGMA setup)
  - `src/features/captures/capture.ts` (domain types, `CaptureRow`, and mapper)
  - `src/features/captures/capture-repository.ts` (repository: `createTextCapture`,
    `listActiveCaptures`)
- **Dependencies:** Added `expo-sqlite` via `npx expo install expo-sqlite`.
  - Version installed: `expo-sqlite@~57.0.3` (Expo SDK 57 compatible).
  - The installation also added the `expo-sqlite` config-plugin entry to `app.json` and lockfile entries in `package-lock.json` (default config-plugin; no advanced options enabled).
- **Decisions and reasoning:**
  - Use `expo-sqlite` directly (no ORM) because the first slice requires a
    single, small table and a minimal repository surface; an ORM would add
    unnecessary complexity and native build surface for now.
  - Keep schema statements static in migration SQL. Use parameter binding for
    all user-provided values in repository functions.
- **Schema and migration (version 1):**
  - Database file: `stow.db` (opened via `SQLiteProvider` in app layout).
  - On init (`onInit`): enable `PRAGMA foreign_keys = ON`, `PRAGMA journal_mode = WAL`.
  - Read `PRAGMA user_version` and only apply missing migrations.
  - Version-1 migration creates table `captures` with columns:
    - `id INTEGER PRIMARY KEY NOT NULL`
    - `text TEXT NULL`
    - `classification TEXT NOT NULL DEFAULT 'unsorted'`
    - `workflow_state TEXT NOT NULL DEFAULT 'active'`
    - `created_at INTEGER NOT NULL`
    - `updated_at INTEGER NOT NULL`
    - `CHECK` constraints to enforce allowed `classification` and `workflow_state` values.
  - Index `captures_workflow_created_idx` on `(workflow_state, created_at)`
    (suitable for listing active captures newest-first).
  - Migration sets `PRAGMA user_version = 1` only after successful creation.
- **Repository functions implemented:**
  - `createTextCapture(db, inputText)`
    - Trims whitespace, rejects empty/whitespace-only text, inserts a new row
      with `classification='unsorted'` and `workflow_state='active'`.
    - Uses parameter binding (`?` parameters) and one timestamp value for
      both `created_at` and `updated_at`.
    - Returns the created `Capture` mapped into the typed domain model.
  - `listActiveCaptures(db)`
    - Returns only captures where `workflow_state = 'active'` ordered by
      `created_at DESC, id DESC` (deterministic newest-first ordering).
- **Documentation consulted:**
  - Expo SDK 57 `expo-sqlite` docs: migrations, `SQLiteProvider`, `onInit`,
    `PRAGMA user_version`, WAL, parameter binding, and transactions.
  - Repository-local docs and the engineering constitution / product
    requirements in `docs/` for approved behavior.
- **Verification performed (local):**
  - Ran `npx expo install expo-sqlite` and confirmed `expo-sqlite@~57.0.3` added to `package.json`/`package-lock.json`.
  - Ran `npx tsc --noEmit` (TypeScript check) — passed with no type errors.
  - Ran `git diff --check` — no whitespace errors reported.
  - Inspected the working-tree diff to confirm only the intended files changed
    and that `src/app/index.tsx` is unchanged.
- **Pending device verification (manual steps):**
  1. Reload the already-running Expo Go session on port `8081`.
  2. Confirm the palette / index route still renders without a database or
     startup error.
  3. Reload a second time to exercise idempotent initialization.
  4. Optionally use the built-in `expo-sqlite` DevTools inspector (Shift+M
     in Expo CLI) to verify the `captures` table and rows.

- **Mistakes and corrections:**
  - The initial report omitted `app.json`, `package.json`, and `package-lock.json` from the exact changed-file list; those files were modified by the `expo-sqlite` installation and are now listed above.
  - The review discovered unnecessary `any` casts in `src/features/captures/*` even though the installed `expo-sqlite` API provides typed run results and generic row-returning helpers; the code was corrected to use a typed `CaptureRow` and generic `getFirstAsync<CaptureRow>`/`getAllAsync<CaptureRow>`. `runAsync()` returns a typed result exposed by the library (including `lastInsertRowId`) and does not require a manual `as` assertion.

- **Technical debt / warnings:**
  - The current startup sequencing keeps font loading and `SplashScreen` logic in `_layout.tsx`. This may hide the native splash before the non-Suspense `SQLiteProvider` finishes opening and migrating the database, since the font-loading effect can call `SplashScreen.hideAsync()` once fonts load. As a result, a brief blank frame is theoretically possible while the provider initializes. Do not redesign splash/database initialization in this correction pass; revisit when the navigation/loading shell is implemented.
- **Learning notes:** `expo-sqlite`'s `SQLiteProvider` + `onInit` provides a
  convenient, lifecycle-aware place to run idempotent migrations before the
  app renders. `PRAGMA user_version` is the recommended lightweight versioning
  mechanism. Use WAL for better write performance as recommended by Expo docs.
- **Platform implications:** Works on the configured Expo SDK 57 and React
  Native 0.86; SQLCipher and other build-time options are available but not
  used here (SQLCipher is not supported on Expo Go).
- **Future image-compression note:** When images are added later, images
  must be compressed before permanent storage; compression library/quality
  settings remain `TBD`.
- **Next step:** Build the Inbox and capture modal UI that uses the newly
  added repository functions to create and list captures (this will be the
  next requested slice).

### 2026-09-12 — Quiet Indigo semantic color system

- **Date:** `2026-09-12`.
- **Milestone:** Implemented the locked Quiet Indigo semantic color system and
  temporary palette verification screen.
- **Requested scope:** Define the approved light and dark semantic color tokens
  and verify them in the existing route without building a product feature.
- **Actual files changed:** Updated `docs/product-requirements.md`,
  `docs/engineering-constitution.md`, `docs/ai-development-log.md`,
  `src/global.css`, and `src/app/index.tsx`.
- **Dependencies:** Unchanged; no dependencies were added, removed, or
  upgraded.
- **Decisions and reasoning:** Used Uniwind's theme-scoped semantic variables
  for the exact Quiet Indigo palette and retained the existing Inter font
  mappings. Kept the route as a compact, temporary verification screen using
  only React Native `View` and `Text` primitives.
- **Documentation consulted:** [Uniwind global CSS](https://docs.uniwind.dev/theming/global-css),
  [Uniwind theme-based styling](https://docs.uniwind.dev/theming/style-based-on-themes),
  [Tailwind theme variables](https://tailwindcss.com/docs/theme), and
  [WCAG 2.2 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast).
- **Verification:** `npx tsc --noEmit` passed. Local Markdown links and the
  final diff were inspected. Device-level visual confirmation remains pending
  through the already-running Expo Go session on port `8081`.
- **Mistakes and corrections:** Review found the original `border-strong` values
  fell slightly below the WCAG non-text contrast minimum of 3:1 when measured
  against `surface-muted`. The token values were corrected to improve contrast
  and meet the intended accessibility target:
  - Light `border-strong`: `#778098` (approx. contrast vs `surface-muted`: 3.470:1)
  - Dark `border-strong`: `#6A7695` (approx. contrast vs `surface-muted`: 3.488:1)

  The implementation and documentation were updated accordingly.

- **Learning notes:** Semantic theme variables let the same component classes
  resolve to different light and dark values without manually forcing a theme.
- **Platform implications:** The screen remains compatible with the existing
  automatic light/dark behavior on Android and iOS.
- **Technical debt and next step:** Replace the temporary verification route
  with an approved product flow only after that flow is documented.
