# Stow Product Requirements

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

## Visible Inbox + New Capture (approved visible slice)

- The initial route is the active-capture Inbox.
- The Inbox lists active captures newest-first.
- An empty Inbox displays a helpful empty state.
- “New capture” opens a dedicated Expo Router modal route.
- The first modal supports text only.
- Save is unavailable for empty or whitespace-only text.
- Saving creates an `Unsorted`, active capture, dismisses the modal, and refreshes the Inbox.
- Cancel or system back leaves without creating a capture.
- Unsaved-draft retention and discard-confirmation behavior remain `TBD`; do not implement either now.
- Editing, classification changes, archive, delete, reminders, images, and image compression are outside this slice.
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
- **List Style:** Flat editorial list. No card backgrounds, rounded capture containers, shadows, badges, icons, thumbnails, or controls.
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
