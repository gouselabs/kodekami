import * as vscode from 'vscode';
import type { ServiceContainer } from './serviceContainer';
import { promptCharacterSelection } from '../character/characterService';
import { viewAchievements } from '../commands/viewAchievements';
import { generateDeveloperCard } from '../commands/developerCard';
import { resetProgress } from '../commands/resetProgress';
import { buildAnalyticsSnapshot } from '../analytics/AnalyticsService';
import { promptThemeSelection } from '../commands/changeTheme';
import { promptCompanionSelection } from '../commands/changeCompanion';
import { AUDIO_VIEW_ID } from '../audio/AudioService';
import { promptStartFocusMode } from '../commands/startFocusMode';
import { promptStartBossBattle } from '../commands/startBossBattle';
import { promptEndFocus } from '../commands/endFocus';
import { promptCompleteQuest } from '../commands/completeQuest';
import { exportProgress } from '../commands/exportProgress';
import { importProgress } from '../commands/importProgress';
import { enableQuietMode, enableWorkMode, restoreNormalMode } from '../commands/modeCommands';
import { registerSaveTracker } from '../tracking/saveTracker';
import { log } from '../utils/logger';

export function registerCommands(context: vscode.ExtensionContext, container: ServiceContainer): void {
	const {
		storage,
		dashboard,
		developerCard,
		sessionSummary,
		analytics,
		focusService,
		questService,
		refreshAll,
		handleXpGranted,
		promptWelcomeIfNeeded
	} = container;

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
		vscode.commands.registerCommand('codekami.changeCompanion', async () => {
			const changed = await promptCompanionSelection(storage);
			if (changed) {
				refreshAll();
			}
		}),
		vscode.commands.registerCommand('codekami.showSoundPanel', () => {
			void vscode.commands.executeCommand(`${AUDIO_VIEW_ID}.focus`);
		}),
		vscode.commands.registerCommand('codekami.startFocusMode', () => promptStartFocusMode(focusService)),
		vscode.commands.registerCommand('codekami.startBossBattle', () => promptStartBossBattle(focusService)),
		vscode.commands.registerCommand('codekami.endFocus', () => promptEndFocus(focusService)),
		vscode.commands.registerCommand('codekami.showFocusPanel', () => {
			if (!focusService.isActive()) {
				void vscode.window.showInformationMessage('No focus session in progress.');
				return;
			}
			focusService.showPanel();
		}),
		vscode.commands.registerCommand('codekami.completeQuest', () => promptCompleteQuest(questService)),
		vscode.commands.registerCommand('codekami.exportProgress', () => exportProgress(storage)),
		vscode.commands.registerCommand('codekami.importProgress', async () => {
			const imported = await importProgress(storage);
			if (imported) {
				log('Progress imported');
				refreshAll();
				void vscode.window.showInformationMessage('CodeKami progress imported successfully.');
				promptWelcomeIfNeeded();
			}
		}),
		vscode.commands.registerCommand('codekami.enableQuietMode', () => enableQuietMode()),
		vscode.commands.registerCommand('codekami.enableWorkMode', () => enableWorkMode()),
		vscode.commands.registerCommand('codekami.restoreNormalMode', () => restoreNormalMode()),
		registerSaveTracker(storage, handleXpGranted)
	);
}
