# CodeKami

Turn your coding journey into a local anime-inspired RPG — directly inside VS Code.

Pick an original archetype, earn XP as you code, level up, build a daily streak, unlock achievements, track real coding sessions, and watch a companion react to your builds, tests, and commits. CodeKami is offline-first and privacy-first: no backend, no database, no account, and no telemetry. Everything is stored locally in VS Code's own extension storage.

## Features

- **Character classes** — choose from 8 original, anime-inspired archetypes (Samurai, Ninja, Mage, Cyber Warrior, Dragon Warrior, Alchemist, Pirate, Demon Hunter), each with its own signature weapon.
- **XP & Levels** — earn XP by starting a coding session and saving files (debounced, so spamming save doesn't farm XP). Level up with a configurable growth curve and titles from Beginner to Legend.
- **Daily streaks** — a coding streak tracked by your local calendar date, with milestone celebrations at 3, 7, 14, 30, 50, 100, and 365 days.
- **Achievements** — 15 original achievements spanning level milestones (Apprentice Warrior through Legendary Developer), streak milestones (No Surrender, Centurion, Unbreakable), coding milestones (Ship It, Test Pilot, Committed), and recovery milestones (Redemption Arc, Bug Slayer — bouncing back from a failed build or test), each with bonus XP.
- **Anime reactions** — short original messages for level-ups, achievements, build/test success and failure, commits, long sessions, and returning after a break — rate-limited so they never spam.
- **Terminal companion** — an emoji-based companion in your status bar that reacts to the same events, plus a mention on the dashboard. 6 companions to unlock as you level up: Cyber Fox (Lv.1), Shadow Cat (Lv.5), Cyber Slime (Lv.10), Spirit Dragon (Lv.25), Zen Panda (Lv.50), and Astral Spirit (Lv.75).
- **Coding sessions** — a session starts when you get to work and ends after a period of inactivity. Tracks duration, files touched, build/test results, and commits, with a summary shown when it ends. Build/test detection works for both `tasks.json`-defined tasks and commands you run directly in a terminal.
- **Local analytics** — today's, this week's, and this month's coding time, sessions, builds, tests, commits, XP, and achievements, plus a 14-day activity chart — all computed on your machine.
- **Sound effects** — optional, off by default. Short sounds for level-ups, achievements, streak milestones, build/test results, commits, and sessions.
- **Custom themes** — 6 original color themes for the CodeKami dashboard and panels (Default Cyber, Samurai Dojo, Void Realm, Demon Realm, Neon City, Spirit Forest), with later ones unlocking as you level up.
- **Daily motivation** — a short, original motivational line on the dashboard, deterministically chosen for the day (no server, no randomness).
- **Focus Mode & Boss Battle** — a distraction-free timer (15/25/45/60 minutes) that earns XP per minute focused. Boss Battle is the same timer with a boss to defeat (5 original bosses), with an HP bar that drains as you focus. A live panel and status bar countdown track progress; ending a session early lets you keep the XP earned so far or abandon it for none.
- **Daily Quests** — 3 quests picked deterministically each day, shown on the dashboard. 5 auto-detect (commit, clean build, passing tests, 30 minutes coding, finishing a Focus/Boss session); 2 are marked complete by hand and clearly labeled as manual.
- **Export / Import Progress** — back up your progress to a JSON file and restore it later, or move it to another machine.
- **Quiet Mode / Work Mode** — one command to silence notifications, reactions, sounds, and session summaries for meetings or screen-sharing; Work Mode also hides the companion and daily motivation. XP and progress keep tracking normally either way.
- **Dashboard** — a clean Webview panel bringing your character, XP, streak, achievements, companion, theme, and daily motivation together in one place.
- **Status bar** — a live, at-a-glance summary (`⚔️ Lv.12 | 🔥 5 | 840 XP`) that opens the dashboard on click.
- **Developer Card** — generate a shareable, local text card summarizing your progress, auto-copied to your clipboard.
- **CodeKami Dark theme** — an original dark editor color theme with anime-inspired accents, built for readability (separate from the dashboard themes above).

## Commands

| Command | Description |
|---|---|
| `CodeKami: Open Dashboard` | View your character, level, XP, streak, achievements, companion, and daily motivation |
| `CodeKami: Change Character` | Pick or re-pick your archetype |
| `CodeKami: View Achievements` | See which achievements are unlocked and locked |
| `CodeKami: Generate Developer Card` | Preview and copy a shareable stats card |
| `CodeKami: View Last Session` | Review your most recently completed coding session |
| `CodeKami: View Analytics` | See your weekly/monthly stats and activity chart |
| `CodeKami: Change Theme` | Pick a dashboard theme (locked ones show the level needed to unlock) |
| `CodeKami: Change Companion` | Pick your status bar companion (locked ones show the level needed to unlock) |
| `CodeKami: Start Focus Mode` | Start a distraction-free focus timer |
| `CodeKami: Start Boss Battle` | Pick a boss and start a focus timer to defeat it |
| `CodeKami: End Focus Session` | End the current focus/boss session early — keep the XP earned so far, or abandon it |
| `CodeKami: Show Focus Panel` | Reopen the live focus/boss battle panel |
| `CodeKami: Complete Quest` | Mark one of today's manual quests as complete |
| `CodeKami: Export Progress` | Save your progress to a JSON file |
| `CodeKami: Import Progress` | Restore progress from a previously exported JSON file (overwrites current progress, with confirmation) |
| `CodeKami: Enable Quiet Mode` | Turn off notifications, reactions, sounds, and session summaries |
| `CodeKami: Enable Work Mode` | Quiet Mode, plus hide the companion and daily motivation |
| `CodeKami: Restore Normal Mode` | Reset Quiet/Work Mode settings back to their defaults |
| `CodeKami: Show Sound Panel` | Open the panel that plays sound effects (needed once per session to allow audio) |
| `CodeKami: Reset Local Progress` | Permanently delete your local CodeKami data (with confirmation) |

## Installation

Requires VS Code 1.93 or newer (for Terminal Shell Integration support). Install **CodeKami** from the VS Code Marketplace by searching for it in the Extensions view, or via the command line:

```bash
code --install-extension gouselabs.codekami
```

## Settings

Configure CodeKami under `Preferences: Open Settings` → search "CodeKami":

**Progress**
- `codekami.sessionStartXp` — XP awarded when a coding session starts
- `codekami.fileSaveXp` — XP awarded per file save
- `codekami.fileSaveCooldownSeconds` — minimum time between file-save XP rewards, per file
- `codekami.sessionInactivityMinutes` — minutes of inactivity before a coding session is considered ended

**Notifications & reactions**
- `codekami.enableNotifications` — streak milestone notifications (default: on)
- `codekami.showReactions` — anime-style reactions for level-ups, achievements, builds, tests, commits, sessions (default: on)
- `codekami.reactionMode` — `notification`, `statusBar`, or `both`
- `codekami.reactionCooldownSeconds` — minimum time between non-critical reactions (level-ups/achievements always bypass this)
- `codekami.showSessionSummary` — show a summary notification when a session ends (default: on)
- `codekami.showCompanion` — show the companion in the status bar (default: on)
- `codekami.showDailyMotivation` — show the daily motivational line on the dashboard (default: on)

**Sound**
- `codekami.enableSounds` — play short sound effects (default: **off**). VS Code (like any browser-based app) requires one click before a background panel is allowed to play audio — the first sound opens a "CodeKami" panel at the bottom, next to Terminal; click it once and it stays enabled for the rest of the session. Reopen it anytime via `CodeKami: Show Sound Panel`.
- `codekami.soundVolume` — sound effect volume, 0–100
- `codekami.soundCooldownSeconds` — minimum time between non-critical sounds (default: 15s; level-up/achievement always bypass it) — lower this if you build/test rapidly and want a sound every time

**Focus**
- `codekami.focusXpPerMinute` — XP earned per minute spent in a Focus Mode or Boss Battle session (default: 3). No XP is earned if a session is abandoned.

**Other**
- `codekami.debugMode` — log activity to the "CodeKami" output channel (no source code or file names, ever)

## Privacy

CodeKami never reads your source code, environment variables, credentials, or terminal output, and never makes any network request. There is no backend, no database, and no account — your progress lives entirely in VS Code's local extension storage on your machine. Build/test detection uses only the official VS Code Tasks API and Terminal Shell Integration API (the command line and exit code only — never terminal output); commit detection uses the built-in Git extension when available and silently does nothing if it isn't.

**Data durability**: since everything is local-only by design, use `CodeKami: Export Progress` to back up your progress to a JSON file. If VS Code's user data directory is ever wiped (not a normal uninstall/reinstall or auto-update — those are safe) and you don't have a recent export, your CodeKami progress is not recoverable.

## Sound credits

Sound effects are sourced from [Mixkit](https://mixkit.co/free-sound-effects/)'s free sound effect library, used under the Mixkit Free License (no attribution required).

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
