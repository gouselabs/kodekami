# Changelog

## [0.1.0] - 2026-09-22

### Added

- Anime-style reactions for level-ups and achievement unlocks — short original messages shown as a notification and/or a transient status bar message.
- Settings: `showReactions`, `reactionMode` (`notification`/`statusBar`/`both`), `reactionCooldownSeconds`.
- Real coding session tracking: a session starts on activity and ends after a period of inactivity (default 30 minutes, configurable). Tracks duration, files touched, build/test attempts and results (via VS Code tasks), and commits (via the built-in Git extension, when available).
- Session summary shown when a session ends, and `CodeKami: View Last Session` to review it anytime.
- Session history is stored locally (capped at 500 sessions, older sessions folded into aggregate totals) and cleared by `CodeKami: Reset Local Progress`.
- Settings: `sessionInactivityMinutes`, `showSessionSummary`.
- Reactions now also cover build success/failure, test success/failure, git commits, long sessions, and returning after inactivity — rate-limited to a shared cooldown (`reactionCooldownSeconds`) so they can't spam. Level-up and achievement reactions still bypass the cooldown.
- `CodeKami: View Analytics` — a local analytics dashboard showing this week's and this month's coding time, sessions, builds, tests, commits, XP, and achievements, plus a 14-day coding activity chart. Everything is computed locally from your own session history; nothing is sent anywhere.
- Terminal companion — an emoji-based companion (starting with 🦊 Cyber Fox) shown in the status bar that reacts to level-ups, achievements, builds, tests, commits, long sessions, and returning after inactivity, plus a mention on the dashboard. More companions and unlock conditions will be added later. Setting: `showCompanion`.
- Sound effects — off by default. When enabled, plays a short sound for level-ups, achievement unlocks, streak milestones, build/test success and failure, commits, long sessions, and returning after inactivity. Level-up and achievement sounds always play; the rest share a cooldown with reactions so they can't spam. Settings: `enableSounds` (default off), `soundVolume`. Sourced from Mixkit's free sound effect library (no attribution required).
- Custom themes for the CodeKami dashboard and panels (separate from the `CodeKami Dark` editor theme): Default Cyber, Samurai Dojo, Void Realm, Demon Realm, Neon City, and Spirit Forest, all original. Later themes unlock at higher levels (5, 10, 25, 50, 75) but the dashboard always stays fully usable regardless of which are unlocked. `CodeKami: Change Theme` to pick one.
- Daily Motivation — a short, original motivational line on the dashboard, deterministically chosen from the local date so it stays the same all day (no server, no randomness). Setting: `showDailyMotivation`.

## [0.0.1] - 2026-09-17

### Added

- Initial release.
- `CodeKami: Open Dashboard` — a Webview panel showing your character, level, XP, streak, and achievement progress.
- Character selection (`CodeKami: Change Character`) across 8 original archetypes.
- XP and level system with a configurable growth curve and titles from Beginner to Legend.
- Activity tracking: XP for starting a coding session and for saving files (debounced to prevent farming).
- Daily streak tracking, with milestones at 3, 7, 14, 30, 50, 100, and 365 days.
- Status bar item showing level, streak, and XP, shown automatically when VS Code starts; click to open the dashboard.
- Achievement system with 5 original achievements and `CodeKami: View Achievements`.
- `CodeKami Dark` color theme.
- `CodeKami: Generate Developer Card` — a shareable stats card, previewed in a panel and copied to the clipboard.
- Settings: `enableNotifications`, `sessionStartXp`, `fileSaveXp`, `fileSaveCooldownSeconds`, `debugMode` — all with sensible defaults.
- `CodeKami: Reset Local Progress`, with a confirmation prompt before permanently deleting local data.
- Local profile storage with a versioned, migratable data model. No backend, no account, no network requests.
