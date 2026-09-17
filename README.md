# CodeKami

Turn your coding journey into an anime-inspired RPG — directly inside VS Code.

Pick an original archetype, earn XP as you code, level up, build a daily streak, unlock achievements, and generate a shareable Developer Card. CodeKami is offline-first and privacy-first: no backend, no database, no account, and no telemetry. Everything is stored locally in VS Code's own extension storage.

## Features

- **Character classes** — choose from 8 original, anime-inspired archetypes (Samurai, Ninja, Mage, Cyber Warrior, Dragon Warrior, Alchemist, Pirate, Demon Hunter), each with its own signature weapon.
- **XP & Levels** — earn XP by starting a coding session and saving files (debounced, so spamming save doesn't farm XP). Level up with a configurable growth curve and titles from Beginner to Legend.
- **Daily streaks** — a coding streak tracked by your local calendar date, with milestone celebrations at 3, 7, 14, 30, 50, 100, and 365 days.
- **Achievements** — unlock original achievements (First Blood, Night Owl, Code Warrior, No Surrender, Legendary Developer) with bonus XP rewards.
- **Dashboard** — a clean Webview panel showing your character, level, XP, streak, and achievement progress.
- **Status bar** — a live, at-a-glance summary (`⚔️ Lv.12 | 🔥 5 | 840 XP`) that opens the dashboard on click.
- **Developer Card** — generate a shareable, local text card summarizing your progress, auto-copied to your clipboard.
- **CodeKami Dark theme** — an original dark color theme with anime-inspired accents, built for readability.

## Commands

| Command | Description |
|---|---|
| `CodeKami: Open Dashboard` | View your character, level, XP, streak, and achievements |
| `CodeKami: Change Character` | Pick or re-pick your archetype |
| `CodeKami: View Achievements` | See which achievements are unlocked and locked |
| `CodeKami: Generate Developer Card` | Preview and copy a shareable stats card |
| `CodeKami: Reset Local Progress` | Permanently delete your local CodeKami data (with confirmation) |

## Installation

Install **CodeKami** from the VS Code Marketplace by searching for it in the Extensions view, or via the command line:

```bash
code --install-extension gouselabs.codekami
```

## Settings

Configure CodeKami under `Preferences: Open Settings` → search "CodeKami":

- `codekami.enableNotifications` — show notifications for level-ups, achievements, and streak milestones (default: on)
- `codekami.sessionStartXp` — XP awarded when a coding session starts
- `codekami.fileSaveXp` — XP awarded per file save
- `codekami.fileSaveCooldownSeconds` — minimum time between file-save XP rewards, per file
- `codekami.debugMode` — log activity to the "CodeKami" output channel (no source code or file names, ever)

## Privacy

CodeKami never reads your source code, environment variables, credentials, or terminal output, and never makes any network request. There is no backend, no database, and no account — your progress lives entirely in VS Code's local extension storage on your machine.

## Contributing / Building from source

```bash
git clone https://github.com/gouselabs/kodekami.git
cd kodekami
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host. Useful scripts:

- `npm run compile` — type-check and build
- `npm run watch` — rebuild on file changes
- `npm test` — run the unit test suite
- `npm run lint` — run ESLint
- `npm run vsix` — produce an installable `.vsix` package

## License

[MIT](./LICENSE)
