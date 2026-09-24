export interface Boss {
	id: string;
	name: string;
	emoji: string;
	flavorText: string;
}

export const BOSSES: ReadonlyArray<Boss> = [
	{ id: 'bug-hydra', name: 'Bug Hydra', emoji: '🐍', flavorText: 'Squash one bug and two more appear. Stay focused.' },
	{ id: 'scope-creep-golem', name: 'Scope Creep Golem', emoji: '🗿', flavorText: 'Grows heavier with every "just one more thing."' },
	{ id: 'merge-conflict-wraith', name: 'Merge Conflict Wraith', emoji: '👹', flavorText: 'Haunts every branch that diverges too long.' },
	{ id: 'deadline-dragon', name: 'Deadline Dragon', emoji: '🐲', flavorText: 'Breathes fire on anyone who checks the clock.' },
	{ id: 'null-pointer-specter', name: 'Null Pointer Specter', emoji: '👻', flavorText: "Appears exactly where you didn't expect it." }
];

export function findBoss(id: string): Boss | undefined {
	return BOSSES.find((boss) => boss.id === id);
}
