export const LEVEL_CONFIG = {
	baseXp: 100,
	growth: 1.15
};

export const LEVEL_TITLES: ReadonlyArray<{ level: number; title: string }> = [
	{ level: 1, title: 'Beginner' },
	{ level: 10, title: 'Apprentice' },
	{ level: 25, title: 'Warrior' },
	{ level: 50, title: 'Elite Warrior' },
	{ level: 75, title: 'Master' },
	{ level: 100, title: 'Legend' }
];

export const STREAK_MILESTONES: ReadonlyArray<number> = [3, 7, 14, 30, 50, 100, 365];
