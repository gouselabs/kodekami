export interface CompanionType {
	id: string;
	name: string;
	emoji: string;
	unlockLevel: number;
}

// Unlock levels intentionally line up with the theme unlock levels
// (see src/themes/themes.ts) for narrative continuity.
export const COMPANION_TYPES: ReadonlyArray<CompanionType> = [
	{ id: 'cyber-fox', name: 'Cyber Fox', emoji: '🦊', unlockLevel: 1 },
	{ id: 'shadow-cat', name: 'Shadow Cat', emoji: '🐱', unlockLevel: 5 },
	{ id: 'cyber-slime', name: 'Cyber Slime', emoji: '🟢', unlockLevel: 10 },
	{ id: 'spirit-dragon', name: 'Spirit Dragon', emoji: '🐉', unlockLevel: 25 },
	{ id: 'zen-panda', name: 'Zen Panda', emoji: '🐼', unlockLevel: 50 },
	{ id: 'astral-spirit', name: 'Astral Spirit', emoji: '👻', unlockLevel: 75 }
];

export const DEFAULT_COMPANION_ID = COMPANION_TYPES[0].id;

export function findCompanionType(id: string): CompanionType | undefined {
	return COMPANION_TYPES.find((companion) => companion.id === id);
}

export function isCompanionUnlocked(companion: CompanionType, level: number): boolean {
	return level >= companion.unlockLevel;
}
