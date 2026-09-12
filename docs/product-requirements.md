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
