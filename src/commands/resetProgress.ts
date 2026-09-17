import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';

export async function resetProgress(storage: StorageService): Promise<boolean> {
	const confirmation = await vscode.window.showWarningMessage(
		'This will permanently delete your local CodeKami progress.',
		{
			modal: true,
			detail: 'Your level, XP, streak, achievements, and character selection will all be reset. This cannot be undone.'
		},
		'Reset'
	);

	if (confirmation !== 'Reset') {
		return false;
	}

	await storage.resetProfile();
	return true;
}
