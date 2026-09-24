# Changelog

## [Unreleased]

### Added

- 2 new achievements (15 total): **Redemption Arc** (recover from a failed build or test with an immediate success) and **Bug Slayer** (reach 10 such recoveries). Recoveries are tracked per coding session and carried into your all-time totals, same as builds/tests/commits.
- 5 new companions (6 total): Shadow Cat, Cyber Slime, Spirit Dragon, Zen Panda, and Astral Spirit join Cyber Fox, unlocking at levels 5/10/25/50/75 (the same milestones as the dashboard themes). A notification announces each one the moment it unlocks. New command: `CodeKami: Change Companion`.
- **Focus Mode** — a distraction-free timer (15/25/45/60 minutes) that earns XP per minute focused, shown in the status bar and a live panel. New commands: `CodeKami: Start Focus Mode`, `CodeKami: End Focus Session`, `CodeKami: Show Focus Panel`. Setting: `codekami.focusXpPerMinute` (default 3).
- **Boss Battle** — the same focus timer with a boss to defeat: pick from 5 original bosses (Bug Hydra, Scope Creep Golem, Merge Conflict Wraith, Deadline Dragon, Null Pointer Specter), watch its HP bar drain as you stay focused, and defeat it when the timer completes. Ending a session early via `CodeKami: End Focus Session` still grants XP for the time actually spent ("Finish now") or ends it with none ("Abandon"). New command: `CodeKami: Start Boss Battle`.
- **Daily Quests** — 3 quests picked deterministically each day (same for the whole day, no server or randomness), shown on the dashboard. 5 are detected automatically (commit, clean build, passing tests, 30 minutes coding, finishing a Focus/Boss session); 2 are marked complete by hand via the new `CodeKami: Complete Quest` command (refactoring, removing unused imports — there's no reliable signal for these) and are clearly labeled as manual on the dashboard.
- **Export / Import Progress** — since everything is stored locally with no backend, there was previously no backup path at all. New commands `CodeKami: Export Progress` (saves a JSON file via a normal Save dialog) and `CodeKami: Import Progress` (overwrites current progress after a confirmation, same as Reset). An export from any past version stays importable — it's written through the same versioned migration path normal storage reads already use, so nothing needs to be re-migrated by hand later.
- **Quiet Mode / Work Mode** — new commands to quickly silence interruptions for meetings or screen-sharing. `CodeKami: Enable Quiet Mode` turns off notifications, reactions, sounds, and session summaries. `CodeKami: Enable Work Mode` does the same and also hides the companion and daily motivation for a more minimal status bar. `CodeKami: Restore Normal Mode` resets all of these back to their defaults. XP and progress keep tracking normally in either mode — only the interruptions are affected.
- `RELEASE_CHECKLIST.md` — a scripted manual QA pass covering the timing and lifecycle behavior automated tests can't reach (races, day rollovers, panel/status-bar lifecycle), run before every package/publish.

### Changed

- Internal: `extension.ts`'s activation logic (previously a single ~270-line function) is now split into `src/extension/serviceContainer.ts`, `registerCommands.ts`, and `registerEventHandlers.ts`. No behavior change — this is purely a structural cleanup now that the command surface has grown to 24 commands across 8 feature areas.

## [0.1.1] - 2026-09-23

### Fixed

- Companion status bar item now actually shows your companion's own emoji (🦊 for Cyber Fox) when idle, instead of always showing a generic mood face. Mood emojis (⚡ level-up, 🔥 build success, etc.) still flash temporarily to react to events, then revert to your companion.
- Companion now reacts to commits and streak milestones — it previously had no reaction mapped for either, despite the settings/docs saying it did.
- Sound effects now actually play, reliably. Several issues, fixed together: (1) the "play" message could reach the sound webview before its script had finished loading, dropping the first sound — fixed with a ready-handshake and a queue; (2) the browser's autoplay policy blocks audio in any webview that hasn't received a user click — sound now lives in a persistent "CodeKami" panel at the bottom (next to Terminal, not a closeable editor tab), so the one-time click only has to happen once per VS Code session, not once per sound or every time a tab gets closed; (3) sound had been silently sharing the 45s reaction cooldown, so rapid builds/tests got no sound with no explanation — it now has its own shorter, independent `soundCooldownSeconds` (default 15s); (4) playback errors and cooldown-suppressed sounds are now logged (with `debugMode` on) instead of failing silently. New command: `CodeKami: Show Sound Panel`.
- Build/test detection now also covers commands run directly in a terminal (e.g. `mvn clean install`, `gradle build`, `npm test`), not just VS Code's own Tasks. Uses the official Terminal Shell Integration API. **This raises the minimum required VS Code version to 1.93.**
- Added de-duplication so a build/test run via both a VS Code Task and its underlying terminal command (common for `shell`-type tasks) is counted once, not twice.
- Extracted the exit-code → success/failure decision into a small tested function; a cancelled or ambiguous command (undefined exit code) is now explicitly, verifiably treated as a failure rather than relying on an untested inline comparison.

### Added

- 8 new achievements (13 total): level milestones at 10/50/75 (Apprentice Warrior, Elite Warrior, Grandmaster), streak milestones at 100/365 days (Centurion, Unbreakable), and coding milestones (Ship It — 25 successful builds, Test Pilot — 50 successful tests, Committed — 50 commits). Build/test/commit achievements now unlock the moment the threshold is hit, using your current session's live counts, not just data from already-ended sessions.
- `CodeKami: View Analytics` now shows **Today** alongside This Week and This Month.

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
