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
import { startSession } from './tracking/sessionTracker';
import { registerSaveTracker } from './tracking/saveTracker';
import { StatusBarService } from './utils/statusBarService';
import { getSettings } from './utils/settings';
import { log } from './utils/logger';

export function activate(context: vscode.ExtensionContext): void {
	const storage = new StorageService(context);
	const dashboard = new DashboardProvider(context.extensionUri, storage);
	const developerCard = new DeveloperCardProvider(context.extensionUri);
	const statusBar = new StatusBarService();
	context.subscriptions.push(statusBar);

	const refreshAll = () => {
		dashboard.refresh();
		statusBar.update(storage.getProfile());
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
			notify(`🔥 Your power has increased! You are now Level ${level} — ${title}.`);
		}
	};

	const syncAchievements = async (achievementContext: AchievementContext) => {
		const result = await checkAchievements(storage, achievementContext);
		refreshAll();
		notifyLevelUps(result.leveledUpTo);
		for (const achievement of result.newlyUnlocked) {
			log(`Achievement unlocked: ${achievement.id}`);
			notify(`🏆 Achievement Unlocked: ${achievement.icon} ${achievement.name} — ${achievement.description}`);
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
		registerSaveTracker(storage, handleXpGranted)
	);

	refreshAll();
	void startSession(storage, handleXpGranted);

	void recordDailyActivity(storage).then((result) => {
		refreshAll();
		if (result.milestone) {
			log(`Streak milestone: ${result.milestone}`);
			notify(`🔥 ${result.milestone} DAY STREAK!`);
		}
		void syncAchievements({});
	});

	promptWelcomeIfNeeded();
}

export function deactivate(): void {
	// No cleanup required for v1.
}
