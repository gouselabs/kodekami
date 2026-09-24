import * as vscode from 'vscode';
import { BOSSES, findBoss } from '../core/bosses';
import { FOCUS_DURATION_OPTIONS_MINUTES } from '../focus/FocusTimer';
import type { FocusService } from '../focus/FocusService';

export async function promptStartBossBattle(focusService: FocusService): Promise<void> {
	if (focusService.isActive()) {
		void vscode.window.showInformationMessage('A focus session is already in progress.');
		return;
	}

	const bossPick = await vscode.window.showQuickPick(
		BOSSES.map((boss) => ({ label: `${boss.emoji} ${boss.name}`, description: boss.flavorText, id: boss.id })),
		{ title: 'CodeKami: Start Boss Battle', placeHolder: 'Choose your opponent' }
	);
	if (!bossPick) {
		return;
	}

	const durationPick = await vscode.window.showQuickPick(
		FOCUS_DURATION_OPTIONS_MINUTES.map((minutes) => ({ label: `${minutes} minutes`, minutes })),
		{ title: 'CodeKami: Boss Battle Duration', placeHolder: 'How long is this battle?' }
	);
	if (!durationPick) {
		return;
	}

	focusService.start(durationPick.minutes, bossPick.id);
	const boss = findBoss(bossPick.id);
	void vscode.window.showInformationMessage(
		`⚔️ Boss Battle started vs ${boss?.emoji} ${boss?.name}! Focus for ${durationPick.minutes} minutes to win.`
	);
}
