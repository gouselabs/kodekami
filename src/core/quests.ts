export type QuestKind = 'auto' | 'manual';

export interface QuestDefinition {
	id: string;
	name: string;
	description: string;
	icon: string;
	kind: QuestKind;
	xpReward: number;
}

// 5 auto-detected quests (wired to codeKamiEvents) and 2 manual ones — there's
// no reliable signal for "refactored something" or "removed unused imports",
// so those are marked complete by hand via `CodeKami: Complete Quest`.
export const QUEST_DEFINITIONS: ReadonlyArray<QuestDefinition> = [
	{ id: 'commit-once', name: 'Commit Something', description: 'Make a git commit today.', icon: '📜', kind: 'auto', xpReward: 15 },
	{ id: 'clean-build', name: 'Clean Build', description: 'Get a successful build today.', icon: '🔨', kind: 'auto', xpReward: 15 },
	{ id: 'tests-pass', name: 'Green Tests', description: 'Get a successful test run today.', icon: '✅', kind: 'auto', xpReward: 15 },
	{
		id: 'thirty-minutes',
		name: 'Half Hour Grind',
		description: 'Code for at least 30 minutes in one sitting today.',
		icon: '⏱️',
		kind: 'auto',
		xpReward: 20
	},
	{
		id: 'finish-focus',
		name: 'Locked In',
		description: 'Complete a Focus Mode or Boss Battle session today.',
		icon: '🎯',
		kind: 'auto',
		xpReward: 20
	},
	{
		id: 'refactor-something',
		name: 'Tidy Up',
		description: "Refactor a piece of code you've been putting off.",
		icon: '🧹',
		kind: 'manual',
		xpReward: 15
	},
	{
		id: 'remove-unused-imports',
		name: 'Spring Cleaning',
		description: 'Remove unused imports from a file.',
		icon: '🗑️',
		kind: 'manual',
		xpReward: 10
	}
];

export function findQuest(id: string): QuestDefinition | undefined {
	return QUEST_DEFINITIONS.find((quest) => quest.id === id);
}
