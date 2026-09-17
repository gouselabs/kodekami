import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';

export interface CharacterClass {
	id: string;
	name: string;
	description: string;
	weapon: string;
}

export const CHARACTER_CLASSES: ReadonlyArray<CharacterClass> = [
	{ id: 'samurai', name: 'Samurai', description: 'Disciplined and precise. Cuts through bugs with a single clean pass.', weapon: 'Clean Code Blade' },
	{ id: 'ninja', name: 'Ninja', description: 'Fast and quiet. Ships features before anyone notices.', weapon: 'Silent Refactor' },
	{ id: 'mage', name: 'Mage', description: 'Bends logic to their will. Favors elegant, arcane solutions.', weapon: 'Arcane Algorithm' },
	{ id: 'cyber-warrior', name: 'Cyber Warrior', description: 'Augmented and relentless. Thrives in high-throughput systems.', weapon: 'Neural Debugger' },
	{ id: 'dragon-warrior', name: 'Dragon Warrior', description: 'Powerful and stubborn. Refuses to let a hard problem win.', weapon: 'Legacy Breaker' },
	{ id: 'alchemist', name: 'Alchemist', description: 'Turns messy legacy code into something usable again.', weapon: 'Code Transmutation' },
	{ id: 'pirate', name: 'Pirate', description: 'Charts their own course. Ships fast and adapts faster.', weapon: 'Rapid Deploy Cutlass' },
	{ id: 'demon-hunter', name: 'Demon Hunter', description: 'Specializes in hunting down the nastiest production bugs.', weapon: 'Bug Exorcism' }
];

export function findCharacterClassByName(name: string | null): CharacterClass | undefined {
	if (!name) {
		return undefined;
	}
	return CHARACTER_CLASSES.find((c) => c.name === name);
}

export async function promptCharacterSelection(storage: StorageService): Promise<boolean> {
	const picked = await vscode.window.showQuickPick(
		CHARACTER_CLASSES.map((c) => ({
			label: c.name,
			description: c.description,
			id: c.id
		})),
		{
			title: 'CodeKami: Choose Your Class',
			placeHolder: 'Select an archetype to begin your journey'
		}
	);

	if (!picked) {
		return false;
	}

	const profile = storage.getProfile();
	await storage.saveProfile({ ...profile, characterClass: picked.label });
	return true;
}
