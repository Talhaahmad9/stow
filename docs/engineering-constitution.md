# Stow Engineering Constitution

This document is the working agreement for building Stow. It applies to human
contributors and AI contributors alike.

## Roles and review

- The product owner defines intent, priorities, and approvals.
- The implementer makes the smallest requested change and reports what was
  actually changed.
- The reviewer performs a read-only review of the diff, relevant files,
  documentation, tests, and risks. Reviewers do not edit the working tree while
  reviewing.
- Review reports must explain the relevant concepts, code, and changes in
  beginner-friendly language so the product owner can learn from each step.
- A change is complete only after the product owner approves it and the review
  findings are resolved or explicitly accepted.

## Delivery loop

1. Clarify the requested scope and update the relevant documentation first.
2. Inspect the repository, current Git diff, and applicable versioned docs.
3. Propose a small implementation step and its verification plan.
4. Implement only that step.
5. Run focused verification and perform a read-only review.
6. Report facts, decisions, failures, and follow-up work; wait for approval
   before the next step.

## Documentation first

Product requirements, technical decisions, and unresolved questions are
written down before implementation. Requirements must describe the intended
behavior without quietly turning assumptions into commitments. Unresolved
questions are labelled `TBD`.

Every meaningful AI-assisted implementation or documentation step records a
factual entry in the [AI development log](ai-development-log.md), including
files changed and verification performed.

Product UI must use semantic color utilities rather than raw color values when
an approved semantic token exists.

## Dependencies

Before adding a dependency, evaluate whether the capability is needed now,
whether Expo or React Native already provides it, whether it supports the
installed Expo and React Native versions (currently Expo SDK 57 and React
Native 0.86) and the target platforms, its maintenance and bundle/native-build
cost, and whether it increases privacy or offline risk. Record the decision and
use Expo's version-compatible installation guidance where applicable.

## TypeScript and modularity

Use strict TypeScript. Avoid `any`, unchecked casts, and implicit contracts.
Keep modules cohesive, names explicit, and public interfaces narrow. Prefer
small, testable functions over clever or deeply coupled implementations.
Numerical file-size limits are intentionally undecided (`TBD`); until they are
set, use judgment and split files when cohesion or reviewability suffers.

Separate these concerns:

- UI components render and handle presentation concerns.
- Application logic expresses use cases and domain rules.
- Persistence owns local storage and data serialization.
- Native integrations own camera, gallery, reminders, permissions, and other
  platform APIs.

Do not hide persistence or native integration details inside presentational
components.

## Routing convention

Expo Router routes live under `src/app`. Files and directories there define the
route tree; `_layout.tsx` files define layout boundaries and `index.tsx` files
represent directory indexes. Keep non-route UI, application logic, persistence,
and native integrations outside the route directory unless a route boundary is
specifically required. This follows the Expo Router SDK 57 convention while
using the configured `src/app` root.

## Platform policy

Android is the first testing target. Code must remain iOS-compatible and avoid
Android-only assumptions in shared behavior. Platform-specific behavior belongs
behind explicit native integration boundaries or platform-specific files.
Web is not an MVP product target, even though the Expo project may retain
configuration needed by the toolchain.

## Verification

Verification is proportional to risk and must be reported honestly. At a
minimum, run focused TypeScript/lint checks and manual checks for changed user
flows when those tools are available. Test persistence, permissions, camera,
gallery, reminders, and platform-specific behavior on real or appropriate
simulated devices before calling those features complete. Record pending
verification rather than implying it passed. Native icon and splash behavior
requires a preview/build verification; Expo Go alone is not sufficient.

## UI foundations

The app must follow the system appearance automatically: light and dark themes
are both required, and the configured `userInterfaceStyle` must remain
`automatic`. The locked visual foundation is Quiet Indigo, the Inter weights
400/500/600, and the Stow brand mark.

## Existing Expo server

If an Expo development server is already running, use it. Do not start, stop,
restart, replace, or otherwise disrupt the existing server during routine work.

## Git discipline

Keep changes focused and reviewable. Inspect the current diff before editing
and do not overwrite unrelated user work. Do not commit, amend, reset, stash,
rebase, or create branches unless explicitly requested. Commits, when
requested, should be small, descriptive, and represent an approved step.

## Explicit non-goals for now

Do not introduce premature abstractions, cloud architecture, global state, or
optimization work before a demonstrated product need. Prefer the simplest
local implementation that satisfies the approved requirement. Revisit these
constraints only through a documented, approved decision.

## Versioned references

The foundation follows the [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/),
including [Expo Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/),
[app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/), and
[SDK 57 Font](https://docs.expo.dev/versions/v57.0.0/sdk/font/) and the
[current Fonts guide](https://docs.expo.dev/develop/user-interface/fonts/).
