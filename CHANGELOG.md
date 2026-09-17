# Changelog

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
