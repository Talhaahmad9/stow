# Stow Product Requirements

## Locked two-page onboarding (v1)

- First install opens a single horizontally swipeable onboarding route with exactly two pages and no automatic advancement or Skip action.
- Page 1 uses the official `assets/images/stow-mark-master.png` logo, the brand name `Stow`, and the subtitle `Stow away your thoughts`. It shows two pagination dots and a full-width `Next` action; `Next` moves to page 2.
- Page 2 is headed `How Stow works` and contains these restrained feature rows:
  - `Capture` — `Save a thought, photo, or file.`
  - `Remember` — `Add a reminder when it matters.`
  - `Sort later` — `Everything starts in your Inbox.`
- Page 2 shows the same two-dot pagination with the second dot active and a full-width `Finish` action.
- Swiping updates the active dot. Finish persists completion before opening Inbox. Android hardware back returns from page 2 to page 1 and keeps normal system behavior on page 1.
- Completion is stored with Expo SQLite key-value storage under the versioned key `stow:onboarding-complete:v1`. Missing or unreadable state safely shows onboarding; completed state opens Inbox.
- Root navigation uses protected routes to gate onboarding versus Inbox/capture routes until startup has resolved fonts, SQLite startup/migrations, and the onboarding flag. The splash remains visible until the correct route tree can render.
- Onboarding uses Inter fonts, semantic palette utilities, safe-area insets, and automatic light/dark styling. The official logo source is rendered with `expo-image` without modification.

## Vision

Stow helps people save fleeting thoughts and useful material without forcing a
classification decision at the moment of capture. It targets the friction and
loss created when a person must interrupt an idea to organize it.

> **Capture now. Sort later.**

## MVP principles

- Stow is local-first and must work offline. Captures remain usable without a
  network connection.
- A capture can contain text, images, or both.
- Images can come from the camera or the device gallery.
- Every new capture defaults to `Unsorted`.
- The available classifications are `Unsorted`, `Note`, `Task`, `Idea`, and
  `Reference`.
- Reminders are independent of classification. A reminder may be attached to
  any capture without changing its classification.
- Workflow state is independent of content and classification. State changes
  such as archival or restoration must not rewrite what the capture contains or
  how it is classified.
- Task-completion behavior is `TBD`.
- Users can archive, restore, and deliberately delete captures. Deletion must
  be an intentional action, not an accidental side effect of archive or
  classification.

Exact retention, trash, and reminder scheduling details are `TBD` until a
specific interaction is approved.

## First capture slice (approved)

- A user can create a text capture.
- Leading and trailing whitespace is removed before persistence.
- Empty or whitespace-only text cannot be saved during the text-only slice.
- A saved capture defaults to `Unsorted` classification.
- A saved capture defaults to the active workflow state.
- Active captures are listed newest-first.
- Captures persist across app restarts using an on-device SQLite database.

Permanent content invariant (applies to all future capture slices):

- A capture must contain non-empty text, at least one image, or both.
- Text is optional when an image exists.
- Images are optional when non-empty text exists.
- A capture containing neither text nor images is invalid and must be rejected.
- The first slice implemented now supports text only; camera and gallery
  support are future steps.

Image handling (future):

- When image support is implemented, camera/gallery images must go through an
  image-compression step before permanent app storage.
- The compression library, dimensions, quality, formats, metadata policy, and
  original-image retention behavior remain `TBD` and must be approved before
  implementation. Do not add or install an image compression library now.

Persistence decision (approved):

- Structured capture metadata uses on-device SQLite (`stow.db`).
- Future image files will live in app-controlled file storage; SQLite will
  store image metadata and file references rather than embedding images in
  capture rows.
- No cloud or network persistence is introduced in the MVP.

Dependency rule for the first slice:

- Only install `expo-sqlite` (Expo SDK 57 compatible) for this slice using
  `npx expo install expo-sqlite`. Do not add an ORM, schema library, or any
  other persistence dependency for the first slice. The decision to avoid an
  ORM is intentional: one small table and a narrow repository surface do not
  justify a heavy abstraction. Record that reasoning in the AI development
  log when implementing.

## Visible Inbox + Composer (approved full slice)

- The initial route is the active-capture Inbox.
- The Inbox lists active captures newest-first.
- An empty Inbox displays a helpful empty state.
- "New capture" opens a dedicated Expo Router modal route with a full-featured composer.
- The composer supports text with optional images, reminders, and draft management.
- Save is unavailable when both text and images are empty.
- Saving creates an `Unsorted`, active capture, dismisses the modal, and refreshes the Inbox.
- Cancel or system back with unsaved content shows a discard confirmation.
- An untouched draft closes immediately without confirmation.
- Classification changes and archive remain outside this slice.
- The UI must support automatic light/dark appearance and safe areas.

## Approved Empty Inbox v1

- **Header:** Large left-aligned `Inbox` title in a distinct header region with a subtle semantic `border` divider below the header.
- **Spacing:** Approximately 24dp horizontal padding across the screen (use existing semantic spacing utilities).
- **Empty state copy:**
  - Headline: `Nothing stowed yet`
  - Supporting lines: `Capture a thought now.` and `You can sort it later.`
- **Layout:** Empty-state content is left aligned and presented as a two-line supporting block; the group sits near the visual middle of the available content area using flexible layout (no absolute positioning).
- **Primary action:** Exactly one bottom-reachable primary `+ New capture` button, nearly full width, approximately 60–64dp tall, rounded, using `bg-accent`, `text-on-accent`, and `active:bg-accent-pressed`. The button sits above safe-area insets and uses an accessible `Pressable` with a descriptive label.
- **Theming:** Automatic semantic light/dark styling only; do not hardcode hex colors or add new theme tokens.
- **Platform chrome:** System status icons and gesture indicators are part of the OS and not part of the app design.
- **Preserved:** The capture-modal visual design remains `TBD`. The populated Inbox is now governed by the Approved Populated Inbox v1 section below.

## Approved Populated Inbox v1

- **Header:** Continue using the existing large left-aligned `Inbox` header and its divider.
- **List Style:** Flat editorial list. No card backgrounds, rounded capture containers, shadows, or badges. Each valid row has only the approved pencil edit control; capture rows are not otherwise pressable.
- **Row Content:**
  - **Capture Text:** Displayed first. Uses `text-foreground` semantic token, Inter Medium 500 (`font-sans-medium`), approximately 18sp (`text-lg`). Natural wrapping allowed up to a maximum of three visible lines. Trailing ellipsis (`numberOfLines={3}`, `ellipsizeMode="tail"`) when text exceeds three lines. Do not shrink text to fit.
  - **Metadata:** `Unsorted` displayed beneath capture text. Uses `text-foreground-muted` semantic token, Inter Regular 400 (`font-sans`), approximately 15–16sp (`text-base`). Visibly secondary with a small vertical gap beneath the capture.
- **Row Layout:** Comfortable vertical padding; rows grow naturally when capture text wraps.
- **Separators:** Subtle full-content-width semantic `border` separator only between rows (using `ItemSeparatorComponent`). No separator above the first row or below the final row.
- **Screen Padding:** Approximately 24dp screen-side padding (matches Approved Empty Inbox).
- **Positioning:** The list begins below the header and scrolls when captures exceed the available area.
- **Bottom Action:** Remains outside the list, above safe-area inset, exactly preserving the manually edited button text.
- **Theming:** Automatic semantic light/dark styling.
- **Implementation:** Uses React Native `FlatList` with `ItemSeparatorComponent` and variable row heights (no `getItemLayout`).

## Approved Composer v1

**Header (creation mode):**
- Cancel left
- `New capture` centered
- Save right
- Save disabled when neither trimmed text nor an image exists
- Save enabled with text, images, or both
- Edit mode uses the same composer with `Edit capture` as its centered title and a separate `Delete capture` action.

**Editor:**
- Large bounded `surface` editor on `background`
- Neutral `border-strong` boundary
- Multiline input at the top
- Placeholder exactly: `What do you want to remember?`
- Android text aligned to the top
- Text remains scrollable/editable
- Keyboard avoidance works on Android and iOS

**Attachment preview:**
- Horizontal thumbnail rail directly above the internal toolbar divider
- Restrained rounded thumbnails (approximately 104dp square)
- Maximum five images
- Each thumbnail has an accessible close/remove control
- Thumbnails never overlap the input or toolbar

**Toolbar:**
- Bottom-left: bell icon plus an always-visible reminder label. It reads
  `Set reminder` until a reminder is selected, then changes to the formatted
  reminder date/time.
- Bottom-right: separate Camera and Paperclip icon buttons
- Reminder is visually separated from media actions
- Use `accent` for the actions and `accent-soft` for icon-button surfaces
- Use accessible Pressables with at least practical 44–48dp targets and meaningful labels

**Draft management:**
- Discard confirmation shows when user cancels or uses system back with unsaved content
- An untouched draft closes immediately without confirmation
- Confirmation modal includes: headline, supporting text, "Keep editing" and "Discard" buttons

## Capture editing and deletion v1

### Inbox

- Every valid capture row has exactly one pencil edit control.
- Use the existing Lucide icon system and semantic `accent` color so it adapts in light and dark mode.
- The pencil is an accessible Pressable with a practical minimum 44dp touch target and `hitSlop`.
- The pencil is positioned at the top-right of its capture row.
- Capture text, metadata, thumbnails, reminders, separators, row heights, scrolling, header, and bottom action remain otherwise unchanged.
- The capture row itself is not pressable. No delete control appears in the Inbox.

### Editing

- The pencil opens the existing composer in edit mode using an optional typed `id` route parameter; the composer UI is not duplicated.
- Edit mode reads `Edit capture` and loads the selected capture’s text, images, and reminder. Existing stored images appear in the attachment rail without reprocessing.
- Users may change text, add/remove images, and add/change/remove a reminder. The maximum five images and permanent-content invariant remain unchanged.
- Save is enabled only when the edited capture is valid, changed, and not currently saving.
- Cancel/system back asks for discard confirmation only when edit-mode changes exist; unchanged edits close immediately. Discarding preserves the original capture and permanent files while cleaning only new temporary files.

### Deletion

- `Delete capture` appears only inside edit mode and uses semantic danger styling. It is absent in creation mode and the Inbox.
- Pressing it confirms with title `Delete capture?`, message `This permanently deletes the capture and its images.`, and `Cancel` / `Delete` actions.
- Confirmed deletion permanently removes the capture, cascaded image records, permanent image files, and associated scheduled reminder where possible. No trash or archive behavior is introduced.

## Approved Reminder Sheet v1

**Trigger:** Tapping `Set reminder` dismisses the keyboard, opens one React Native bottom-sheet-style modal, dims the composer, and does not navigate to a full-screen route.

**Content:**
- Title: `Set reminder`
- Close control
- Inline time control with hour and minute inputs plus AM/PM selection; date
  selection remains native calendar selection for the MVP
- Human-readable selected summary in 12-hour format (e.g., "Today, 6:00 PM" or
  "14 Sep, 2:30 PM")
- Cancel
- Primary `Set reminder`
- Remove reminder action when editing an existing reminder

**Behavior:**
- When a reminder is already selected: replace `Set reminder` in the composer with a concise local-time summary; tapping it reopens the sheet for editing
- Use current date as minimum selectable date
- A confirmed reminder must be in the future
- Initialize a new selection to the next sensible future hour with the
  corresponding AM/PM period
- Use the locked semantic palette; do not copy colors from other sources

**Platform-specific components:**
- Android MVP: native calendar-style date selection from
  `@expo/ui/jetpack-compose`, with a simple custom 12-hour hour/minute input
  and AM/PM selection
- iOS: native DatePicker and time controls from `@expo/ui/swift-ui` remain
  future platform work

## Approved Image Handling

**Image acquisition:**
- Camera opens the camera directly and adds one image at a time
- Gallery may select multiple images up to the remaining capacity
- Paperclip opens the system Files/document picker directly
- Attachments accept image files only in this MVP
- PDF and broader file support are deferred without requiring a toolbar redesign
- Still images only, no video
- No crop UI

**Image limits:**
- Maximum five images per capture

**Image processing:**
- Use the modern contextual Expo ImageManipulator API, not deprecated `manipulateAsync`
- For every camera, gallery, or file image:
  - Preserve aspect ratio
  - Resize only when the longest edge exceeds `2048`
  - Set only one resize dimension so aspect ratio is preserved
  - Convert the processed result to JPEG
  - Compression quality: approximately `0.82`
  - Do not request or store Base64
  - Do not request or persist EXIF metadata
  - Do not retain a second permanent copy of the original
  - Store only the processed image permanently

**Storage:**
- Picker/manipulator output is temporary
- Use the modern File, Directory, and Paths API from `expo-file-system` to move/copy processed images into app-controlled document storage when the capture is saved
- Temporary draft images are cleaned up when: the user removes an image, discards the draft, or saving fails before ownership transfers to the saved capture
- Use unique collision-safe filenames; do not expose original external filenames as persistent identifiers
- Handle `ImagePicker.getPendingResultAsync()` on Android so picker results are not silently lost if Android destroys and recreates the activity

## Approved Inbox Concept B

**Preserve:** Existing header, flat editorial list, separators, scrolling, safe areas, and protected bottom button.

**Text-only capture:**
- Existing full-width row remains visually unchanged
- Capture text: maximum three lines, tail ellipsis
- `Unsorted` beneath it

**Text plus images:**
- Show approximately 104dp square leading thumbnail
- Text and metadata appear to its right
- Metadata format: `Unsorted · 1 image` or correct plural count
- Never display image count twice

**Image-only capture:**
- Do not invent a title
- Show up to two leading thumbnails side by side
- Metadata beneath: `Unsorted · 2 images` with correct singular/plural grammar

**More than one image when only one preview is shown:**
- First image is the thumbnail
- Overlay `+N` for the remaining images
- Use a restrained contrast scrim for legibility

**Reminder metadata (all captures with reminders):**
- First metadata line remains classification plus image count where applicable
- Second compact metadata line contains: bell icon, reminder formatted as `14 Sep, 2:00 PM`
- Both the bell and reminder date/time must use semantic `accent` purple
- In dark mode, they automatically use the locked lighter dark-theme accent
- Never place the bell alone
- Do not make reminder metadata a badge, pill, or button

**Implementation:**
- Use `expo-image` for local thumbnails with cover behavior and accessible description
- Do not add fixed item-height calculations or `getItemLayout`; rows remain variable height

## Notifications and Reminders

**Local reminders only:**
- No push-token registration
- No backend
- No recurring reminders
- No snooze
- No multiple reminders per capture

**Setup:**
- Create a clearly named Android notification channel before requesting notification permission
- Request notification permission only when the user confirms a reminder
- If permission is denied, explain it clearly, do not attach a nonfunctional reminder, and still allow the capture to be saved without one

**Scheduling:**
- Schedule the local notification for the selected future date and time
- Store the notification identifier with the capture
- Notification content should work for text, image-only, and mixed captures
- Include the capture ID in notification data for future navigation, but do not implement unapproved navigation behavior now
- If scheduling fails, do not claim that a reminder exists
- Clean up any newly scheduled notification if the save transaction subsequently fails

## Visual foundation

The visual direction is locked as follows:

- Quiet Indigo is the brand color direction.
- Light and dark themes follow the device automatically.
- Inter weights 400, 500, and 600 are the approved typography foundation.
- The Stow brand mark is the approved mark, including the tucked-ribbon `S`
  design decision.

The locked Quiet Indigo semantic color palette is:

| Token              | Light     | Dark      |
| ------------------ | --------- | --------- |
| `background`       | `#F5F7FF` | `#0B1020` |
| `surface`          | `#FFFFFF` | `#12182A` |
| `surface-muted`    | `#EEF0FA` | `#1A2238` |
| `foreground`       | `#111827` | `#F5F7FF` |
| `foreground-muted` | `#626B7D` | `#AAB3C5` |
| `border`           | `#DDE1EE` | `#2A344D` |
| `border-strong`    | `#778098` | `#6A7695` |
| `accent`           | `#5B5BD6` | `#9896FF` |
| `accent-pressed`   | `#4848B8` | `#8583E8` |
| `accent-soft`      | `#ECECFF` | `#25264A` |
| `on-accent`        | `#FFFFFF` | `#0B1020` |
| `danger`           | `#C43D4F` | `#FF7A8A` |
| `danger-soft`      | `#FEEFF1` | `#3A1D29` |
| `on-danger`        | `#FFFFFF` | `#1A0810` |

Spacing scales and component specifications are `TBD`.

### Border usage guidance

- `border`: decorative separators and non-essential boundaries.
- `border-strong`: boundaries necessary to identify a control or state.

## Platform scope

- Android is the first testing platform.
- The implementation must remain compatible with iOS.
- Web is excluded from the MVP product scope. Any web configuration retained in
  the Expo project is tooling or future-facing infrastructure, not an MVP
  commitment.

## Explicit MVP exclusions

The MVP does not include:

- authentication;
- cloud sync or cloud architecture;
- AI features;
- voice capture;
- widgets;
- sharing integration;
- or other roadmap features not explicitly approved in this document.

## Decisions and change control

Unresolved product, UX, platform, retention, privacy, and technical decisions
must be labelled `TBD`. Contributors must not invent requirements to fill a
gap. A proposed resolution should state its rationale, affected scope, and
verification plan before it becomes part of the MVP contract.
