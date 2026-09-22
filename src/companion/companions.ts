export interface CompanionType {
	id: string;
	name: string;
	emoji: string;
	unlockCondition: string;
}

// Only Cyber Fox exists today. Future companions (Mini Samurai, Spirit Dragon,
// Code Raven, Cyber Cat, Void Demon) get added here with real unlock conditions
// once there's more than one to choose between.
export const COMPANION_TYPES: ReadonlyArray<CompanionType> = [
	{ id: 'cyber-fox', name: 'Cyber Fox', emoji: '🦊', unlockCondition: 'Available from the start' }
];

export const DEFAULT_COMPANION_ID = COMPANION_TYPES[0].id;

export function findCompanionType(id: string): CompanionType | undefined {
	return COMPANION_TYPES.find((companion) => companion.id === id);
}
