# Stow

Stow is a local-first capture app for saving thoughts and useful material before
sorting them. Its guiding idea is **Capture now. Sort later.**

## Current foundation

The project is currently a minimal Expo Router baseline. The Expo template
content has been removed, Stow branding and PNG assets are configured, and the
foundation includes automatic light/dark themes, Uniwind styling, and runtime
loading for Inter 400, 500, and 600. No product feature has been implemented
yet.

Native icon and splash configuration is present, but preview-build verification
for those native assets is still pending.

## Technology stack

- Expo SDK 57 and React Native 0.86
- Expo Router with file-based routes in `src/app`
- TypeScript with strict project conventions
- Uniwind and Tailwind CSS 4
- `@expo-google-fonts/inter` for Inter 400/500/600
- Expo splash-screen and automatic system appearance support

## Setup

```bash
npm install
npx expo start
```

Use the existing Expo development server when one is already running; do not
start, stop, restart, or replace it as part of routine work.

## Project documents

- [Engineering constitution](docs/engineering-constitution.md)
- [Product requirements](docs/product-requirements.md)
- [AI development log](docs/ai-development-log.md)
