import * as vscode from 'vscode';
import { StorageService } from './storage/storageService';
import { DashboardProvider } from './webview/dashboardProvider';
import { DeveloperCardProvider } from './webview/developerCardProvider';
import { promptCharacterSelection } from './character/characterService';
import { viewAchievements } from './commands/viewAchievements';
import { generateDeveloperCard } from './commands/developerCard';
import { resetProgress } from './commands/resetProgress';
import { getTitleForLevel } from './core/levelSystem';
import { GrantXpResult } from './core/xpSystem';
import { recordDailyActivity } from './core/streakSystem';
import { AchievementContext, checkAchievements } from './core/achievementSystem';
import { startSession, SessionTrackerService } from './tracking/sessionTracker';
import { registerSaveTracker } from './tracking/saveTracker';
import { registerBuildTestTracker } from './tracking/buildTestTracker';
import { registerGitTracker } from './tracking/gitTracker';
import { StatusBarService } from './utils/statusBarService';
import { getSettings } from './utils/settings';
import { log } from './utils/logger';
import { codeKamiEvents } from './events/codeKamiEvents';
import { ReactionService } from './reactions/ReactionService';
import { SessionSummaryProvider } from './webview/sessionSummaryProvider';
import { AnalyticsProvider } from './webview/analyticsProvider';
import { buildAnalyticsSnapshot } from './analytics/AnalyticsService';
import { CompanionService } from './companion/CompanionService';
import { AudioService } from './audio/AudioService';
import { promptThemeSelection } from './commands/changeTheme';

let activeSessionTracker: SessionTrackerService | undefined;

export function activate(context: vscode.ExtensionContext): void {
	const storage = new StorageService(context);
	const dashboard = new DashboardProvider(context.extensionUri, storage);
	const developerCard = new DeveloperCardProvider(context.extensionUri, storage);
	const sessionSummary = new SessionSummaryProvider(context.extensionUri, storage);
	const analytics = new AnalyticsProvider(context.extensionUri, storage);
	const statusBar = new StatusBarService();
	const reactionService = new ReactionService();
	const companionService = new CompanionService(storage);
	const audioService = new AudioService(context.extensionUri);
	const sessionTracker = new SessionTrackerService(storage);
	activeSessionTracker = sessionTracker;
	context.subscriptions.push(
		statusBar,
		reactionService,
		companionService,
		audioService,
		codeKamiEvents,
		sessionTracker,
		registerBuildTestTracker(sessionTracker),
		registerGitTracker(sessionTracker)
	);

	const refreshAll = () => {
		dashboard.refresh();
		statusBar.update(storage.getProfile());
		companionService.refresh();
	};

	const notify = (message: string) => {
		if (getSettings().enableNotifications) {
			void vscode.window.showInformationMessage(message);
		}
	};

	const notifyLevelUps = (levels: number[]) => {
		for (const level of levels) {
			const title = getTitleForLevel(level);
			log(`Level up -> ${level}`);
			codeKamiEvents.emit({ type: 'levelUp', level, title });
		}
	};

	const syncAchievements = async (achievementContext: AchievementContext) => {
		const result = await checkAchievements(storage, achievementContext);
		refreshAll();
		notifyLevelUps(result.leveledUpTo);
		for (const achievement of result.newlyUnlocked) {
			log(`Achievement unlocked: ${achievement.id}`);
			codeKamiEvents.emit({ type: 'achievementUnlocked', achievement });
		}
	};

	const handleXpGranted = (result: GrantXpResult, achievementContext: AchievementContext) => {
		refreshAll();
		notifyLevelUps(result.leveledUpTo);
		void syncAchievements(achievementContext);
	};

	const promptWelcomeIfNeeded = () => {
		if (storage.getProfile().characterClass) {
			return;
		}
		void vscode.window
			.showInformationMessage('Welcome to CodeKami! Choose your class to begin your journey.', 'Choose Class')
			.then((selection) => {
				if (selection === 'Choose Class') {
					void vscode.commands.executeCommand('codekami.changeCharacter');
				}
			});
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('codekami.openDashboard', () => {
			dashboard.show();
		}),
		vscode.commands.registerCommand('codekami.changeCharacter', async () => {
			const changed = await promptCharacterSelection(storage);
			if (changed) {
				refreshAll();
			}
		}),
		vscode.commands.registerCommand('codekami.viewAchievements', () => viewAchievements(storage)),
		vscode.commands.registerCommand('codekami.generateDeveloperCard', () => generateDeveloperCard(storage, developerCard)),
		vscode.commands.registerCommand('codekami.resetProgress', async () => {
			const didReset = await resetProgress(storage);
			if (didReset) {
				log('Progress reset');
				refreshAll();
				void vscode.window.showInformationMessage('CodeKami progress has been reset.');
				promptWelcomeIfNeeded();
			}
		}),
		vscode.commands.registerCommand('codekami.viewLastSession', () => {
			const sessions = storage.getSessionHistory().sessions;
			const last = sessions[sessions.length - 1];
			if (!last) {
				void vscode.window.showInformationMessage('No completed coding sessions yet.');
				return;
			}
			sessionSummary.show(last, storage.getProfile().streak);
		}),
		vscode.commands.registerCommand('codekami.viewAnalytics', () => {
			analytics.show(buildAnalyticsSnapshot(storage));
		}),
		vscode.commands.registerCommand('codekami.changeTheme', async () => {
			const changed = await promptThemeSelection(storage);
			if (changed) {
				refreshAll();
			}
		}),
		registerSaveTracker(storage, handleXpGranted),
		codeKamiEvents.onEvent((event) => {
			if (event.type !== 'sessionEnded') {
				return;
			}
			refreshAll();
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

	refreshAll();
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
