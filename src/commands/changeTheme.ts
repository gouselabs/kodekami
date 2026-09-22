import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { THEMES, isThemeUnlocked } from '../themes/themes';

interface ThemeQuickPickItem extends vscode.QuickPickItem {
	id: string;
	unlocked: boolean;
	unlockLevel: number;
}

export async function promptThemeSelection(storage: StorageService): Promise<boolean> {
	const level = storage.getProfile().level;
	const items: ThemeQuickPickItem[] = THEMES.map((theme) => {
		const unlocked = isThemeUnlocked(theme, level);
		return {
			label: unlocked ? theme.name : `$(lock) ${theme.name}`,
			description: unlocked ? '' : `Unlocks at Level ${theme.unlockLevel}`,
			id: theme.id,
			unlocked,
			unlockLevel: theme.unlockLevel
		};
	});

	const picked = await vscode.window.showQuickPick(items, {
		title: 'CodeKami: Choose Your Theme',
		placeHolder: 'Select a theme for the CodeKami dashboard and panels'
	});

	if (!picked) {
		return false;
	}

	if (!picked.unlocked) {
		void vscode.window.showInformationMessage(`This theme unlocks at Level ${picked.unlockLevel}. Keep coding!`);
		return false;
	}

	const current = storage.getThemeSelection();
	await storage.saveThemeSelection({ ...current, selectedThemeId: picked.id });
	return true;
}
