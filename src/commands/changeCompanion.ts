import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { COMPANION_TYPES, isCompanionUnlocked } from '../companion/companions';

interface CompanionQuickPickItem extends vscode.QuickPickItem {
	id: string;
	unlocked: boolean;
	unlockLevel: number;
}

export async function promptCompanionSelection(storage: StorageService): Promise<boolean> {
	const level = storage.getProfile().level;
	const state = storage.getCompanionState();
	const items: CompanionQuickPickItem[] = COMPANION_TYPES.map((companion) => {
		const unlocked = isCompanionUnlocked(companion, level);
		const isSelected = companion.id === state.selectedCompanionId;
		return {
			label: unlocked ? `${companion.emoji} ${companion.name}` : `$(lock) ${companion.name}`,
			description: unlocked ? (isSelected ? 'Selected' : '') : `Unlocks at Level ${companion.unlockLevel}`,
			id: companion.id,
			unlocked,
			unlockLevel: companion.unlockLevel
		};
	});

	const picked = await vscode.window.showQuickPick(items, {
		title: 'CodeKami: Choose Your Companion',
		placeHolder: 'Select a companion to react alongside your coding'
	});

	if (!picked) {
		return false;
	}

	if (!picked.unlocked) {
		void vscode.window.showInformationMessage(`This companion unlocks at Level ${picked.unlockLevel}. Keep coding!`);
		return false;
	}

	await storage.saveCompanionState({ ...state, selectedCompanionId: picked.id });
	return true;
}
