import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { DashboardProvider } from '../webview/dashboardProvider';
import { DeveloperCardProvider } from '../webview/developerCardProvider';
import { SessionSummaryProvider } from '../webview/sessionSummaryProvider';
import { AnalyticsProvider } from '../webview/analyticsProvider';
import { StatusBarService } from '../utils/statusBarService';
import { ReactionService } from '../reactions/ReactionService';
import { CompanionService } from '../companion/CompanionService';
import { AudioService, AUDIO_VIEW_ID } from '../audio/AudioService';
import { SessionTrackerService } from '../tracking/sessionTracker';
import { registerBuildTestTracker } from '../tracking/buildTestTracker';
import { registerTerminalCommandTracker } from '../tracking/terminalCommandTracker';
import { registerGitTracker } from '../tracking/gitTracker';
import { FocusPanelProvider } from '../webview/focusProvider';
import { FocusService } from '../focus/FocusService';
import { QuestService } from '../quests/QuestService';
import { codeKamiEvents } from '../events/codeKamiEvents';
import { getTitleForLevel } from '../core/levelSystem';
import { GrantXpResult } from '../core/xpSystem';
import { AchievementContext, checkAchievements } from '../core/achievementSystem';
import { syncCompanionUnlocks } from '../core/companionUnlock';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';

/**
 * Constructs every CodeKami service once and wires the small set of shared
 * callbacks (refreshAll, XP/achievement syncing, companion unlock checks)
 * that multiple trackers and commands need. `registerCommands` and
 * `registerEventHandlers` both take this as their only dependency.
 */
export interface ServiceContainer {
	storage: StorageService;
	dashboard: DashboardProvider;
	developerCard: DeveloperCardProvider;
	sessionSummary: SessionSummaryProvider;
	analytics: AnalyticsProvider;
	sessionTracker: SessionTrackerService;
	focusService: FocusService;
	questService: QuestService;
	refreshAll: () => void;
	notify: (message: string) => void;
	syncAchievements: (context: AchievementContext) => Promise<void>;
	handleXpGranted: (result: GrantXpResult, context: AchievementContext) => void;
	syncCompanionUnlocksForLevel: (level: number) => Promise<void>;
	promptWelcomeIfNeeded: () => void;
}

export function createServiceContainer(context: vscode.ExtensionContext): ServiceContainer {
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

	context.subscriptions.push(
		statusBar,
		reactionService,
		companionService,
		audioService,
		vscode.window.registerWebviewViewProvider(AUDIO_VIEW_ID, audioService, {
			webviewOptions: { retainContextWhenHidden: true }
		}),
		codeKamiEvents,
		sessionTracker,
		registerBuildTestTracker(sessionTracker),
		registerTerminalCommandTracker(sessionTracker),
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

	const syncCompanionUnlocksForLevel = async (level: number) => {
		const state = storage.getCompanionState();
		const { state: updated, newlyUnlocked } = syncCompanionUnlocks(state, level);
		if (newlyUnlocked.length === 0) {
			return;
		}
		await storage.saveCompanionState(updated);
		for (const companion of newlyUnlocked) {
			log(`Companion unlocked: ${companion.id}`);
			notify(`${companion.emoji} New companion unlocked: ${companion.name}! Use "CodeKami: Change Companion" to select it.`);
		}
	};

	const notifyLevelUps = (levels: number[]) => {
		for (const level of levels) {
			const title = getTitleForLevel(level);
			log(`Level up -> ${level}`);
			codeKamiEvents.emit({ type: 'levelUp', level, title });
		}
		if (levels.length > 0) {
			void syncCompanionUnlocksForLevel(storage.getProfile().level);
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

	const focusPanelProvider = new FocusPanelProvider(context.extensionUri, storage);
	const focusService = new FocusService(storage, focusPanelProvider, handleXpGranted);
	context.subscriptions.push(focusService);

	const questService = new QuestService(storage, handleXpGranted, (quest) => {
		refreshAll();
		notify(`${quest.icon} Quest complete: ${quest.name}! +${quest.xpReward} XP`);
	});
	context.subscriptions.push(questService);

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

	return {
		storage,
		dashboard,
		developerCard,
		sessionSummary,
		analytics,
		sessionTracker,
		focusService,
		questService,
		refreshAll,
		notify,
		syncAchievements,
		handleXpGranted,
		syncCompanionUnlocksForLevel,
		promptWelcomeIfNeeded
	};
}
