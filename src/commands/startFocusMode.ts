import * as vscode from 'vscode';
import { FOCUS_DURATION_OPTIONS_MINUTES } from '../focus/FocusTimer';
import type { FocusService } from '../focus/FocusService';

export async function promptStartFocusMode(focusService: FocusService): Promise<void> {
	if (focusService.isActive()) {
		void vscode.window.showInformationMessage('A focus session is already in progress.');
		return;
	}

	const picked = await vscode.window.showQuickPick(
		FOCUS_DURATION_OPTIONS_MINUTES.map((minutes) => ({ label: `${minutes} minutes`, minutes })),
		{ title: 'CodeKami: Start Focus Mode', placeHolder: 'How long do you want to focus?' }
	);
	if (!picked) {
		return;
	}

	focusService.start(picked.minutes);
	void vscode.window.showInformationMessage(`🎯 Focus session started — ${picked.minutes} minutes. Stay locked in!`);
}
