# CodeKami

Turn your coding journey into an anime-inspired RPG — directly inside VS Code.

CodeKami is offline-first and privacy-first: no backend, no database, no account, no telemetry. All progress is stored locally in VS Code's extension storage.

## Status

This project is under active development. See [SPEC.md](./SPEC.md) for the full product specification and roadmap.

Current milestone: **scaffold** — extension activation, one command (`CodeKami: Open Dashboard`), and a minimal local profile.

## Development

```bash
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host.

### Scripts

- `npm run compile` — type-check and build
- `npm run watch` — rebuild on file changes
- `npm run lint` — run ESLint
- `npm run package` — production build
- `npm run vsix` — produce an installable `.vsix` package

## Installing from VSIX

```bash
npx vsce package
```

Then in VS Code: Extensions → `...` menu → Install from VSIX.

## Privacy

CodeKami never reads your source code, environment variables, credentials, or terminal output, and never makes network requests in v1. See [SPEC.md](./SPEC.md#5-privacy-requirements) for details.
