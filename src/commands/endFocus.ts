import * as vscode from 'vscode';
import type { FocusService } from '../focus/FocusService';

export async function promptEndFocus(focusService: FocusService): Promise<void> {
	if (!focusService.isActive()) {
		void vscode.window.showInformationMessage('No focus session in progress.');
		return;
	}

	const picked = await vscode.window.showQuickPick(
		[
			{ label: '🏆 Finish now', description: 'Grants XP for the time you spent', value: 'win' as const },
			{ label: '🏳️ Abandon', description: 'No XP for this session', value: 'abandon' as const }
		],
		{ title: 'CodeKami: End Focus Session', placeHolder: 'How do you want to end this session?' }
	);
	if (!picked) {
		return;
	}

	if (picked.value === 'win') {
		await focusService.declareVictory();
	} else {
		await focusService.cancel();
	}
}
