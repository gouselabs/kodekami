import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { ACHIEVEMENTS, isUnlocked } from '../core/achievementSystem';

export async function viewAchievements(storage: StorageService): Promise<void> {
	const profile = storage.getProfile();

	const items: vscode.QuickPickItem[] = ACHIEVEMENTS.map((definition) => {
		const unlocked = isUnlocked(profile, definition.id);
		return {
			label: `${unlocked ? definition.icon : '🔒'} ${definition.name}`,
			description: unlocked ? 'Unlocked' : 'Locked',
			detail: definition.description
		};
	});

	const unlockedCount = ACHIEVEMENTS.filter((definition) => isUnlocked(profile, definition.id)).length;

	await vscode.window.showQuickPick(items, {
		title: `CodeKami Achievements — ${unlockedCount} / ${ACHIEVEMENTS.length}`,
		placeHolder: 'Your unlocked and locked achievements'
	});
}
