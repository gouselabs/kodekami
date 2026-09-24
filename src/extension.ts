import * as vscode from 'vscode';
import { createServiceContainer } from './extension/serviceContainer';
import { registerCommands } from './extension/registerCommands';
import { registerEventHandlers } from './extension/registerEventHandlers';
import { startSession, SessionTrackerService } from './tracking/sessionTracker';
import { recordDailyActivity } from './core/streakSystem';
import { codeKamiEvents } from './events/codeKamiEvents';
import { log } from './utils/logger';

let activeSessionTracker: SessionTrackerService | undefined;

export function activate(context: vscode.ExtensionContext): void {
	const container = createServiceContainer(context);
	activeSessionTracker = container.sessionTracker;

	registerCommands(context, container);
	registerEventHandlers(context, container);

	const { storage, refreshAll, notify, syncAchievements, syncCompanionUnlocksForLevel, handleXpGranted, promptWelcomeIfNeeded } =
		container;

	refreshAll();
	void syncCompanionUnlocksForLevel(storage.getProfile().level);
	void startSession(storage, handleXpGranted);

	void recordDailyActivity(storage).then((result) => {
		refreshAll();
		if (result.milestone) {
			log(`Streak milestone: ${result.milestone}`);
			notify(`🔥 ${result.milestone} DAY STREAK!`);
			codeKamiEvents.emit({ type: 'streakMilestone', milestone: result.milestone });
		}
		void syncAchievements({});
	});

	promptWelcomeIfNeeded();
}

export function deactivate(): Thenable<void> | undefined {
	return activeSessionTracker?.finalize();
}
