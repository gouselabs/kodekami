import * as vscode from 'vscode';
import type { ServiceContainer } from './serviceContainer';
import { codeKamiEvents } from '../events/codeKamiEvents';
import { buildAchievementContext } from '../core/achievementContextBuilder';
import { getSettings } from '../utils/settings';

export function registerEventHandlers(context: vscode.ExtensionContext, container: ServiceContainer): void {
	const { storage, sessionTracker, sessionSummary, refreshAll, notify, syncAchievements } = container;

	context.subscriptions.push(
		codeKamiEvents.onEvent((event) => {
			if (event.type === 'sessionStarted') {
				const cardName = storage.getProfile().cardName;
				notify(cardName ? `⚔️ Welcome back, ${cardName}! Let's begin the battle!` : "⚔️ Welcome back! Let's begin the battle!");
				return;
			}

			if (event.type === 'taskCompleted' || event.type === 'commit') {
				void syncAchievements(buildAchievementContext(sessionTracker));
				return;
			}

			if (event.type !== 'sessionEnded') {
				return;
			}
			refreshAll();
			void syncAchievements({});
			if (!getSettings().showSessionSummary) {
				return;
			}
			void vscode.window
				.showInformationMessage(
					`⚔ Session complete — ${event.session.durationMinutes}m, +${event.session.xpEarned} XP`,
					'View Summary'
				)
				.then((selection) => {
					if (selection === 'View Summary') {
						sessionSummary.show(event.session, storage.getProfile().streak);
					}
				});
		})
	);
}
