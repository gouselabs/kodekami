export type ReactionEventType =
	| 'levelUp'
	| 'achievementUnlocked'
	| 'buildSuccess'
	| 'buildFailure'
	| 'testSuccess'
	| 'testFailure'
	| 'commit'
	| 'longSession'
	| 'returnAfterInactivity';

export interface AnimeReaction {
	id: string;
	event: ReactionEventType;
	message: string;
	priority: number;
}

export const REACTIONS: ReadonlyArray<AnimeReaction> = [
	{ id: 'level-up-01', event: 'levelUp', message: '🔥 Your power has increased.', priority: 1 },
	{ id: 'level-up-02', event: 'levelUp', message: '⚡ A new power awakens.', priority: 1 },
	{ id: 'level-up-03', event: 'levelUp', message: '⚔️ Your blade grows sharper.', priority: 1 },
	{ id: 'level-up-04', event: 'levelUp', message: '🌩 The next chapter begins.', priority: 1 },

	{ id: 'achievement-01', event: 'achievementUnlocked', message: '🏆 New title unlocked.', priority: 1 },
	{ id: 'achievement-02', event: 'achievementUnlocked', message: '✨ Your legend grows.', priority: 1 },
	{ id: 'achievement-03', event: 'achievementUnlocked', message: '👑 A milestone worth remembering.', priority: 1 },

	{ id: 'build-success-01', event: 'buildSuccess', message: '⚔️ Clean strike.', priority: 1 },
	{ id: 'build-success-02', event: 'buildSuccess', message: '✨ Technique perfected.', priority: 1 },

	{ id: 'build-failure-01', event: 'buildFailure', message: '👹 The enemy survives.', priority: 1 },
	{ id: 'build-failure-02', event: 'buildFailure', message: '⚡ Don’t retreat. Analyze and strike again.', priority: 1 },

	{ id: 'test-success-01', event: 'testSuccess', message: '🎯 Target eliminated.', priority: 1 },
	{ id: 'test-success-02', event: 'testSuccess', message: '✅ Trial completed.', priority: 1 },

	{ id: 'test-failure-01', event: 'testFailure', message: '⚔️ The battle continues.', priority: 1 },
	{ id: 'test-failure-02', event: 'testFailure', message: '🛡️ Not yet. Regroup and try again.', priority: 1 },

	{ id: 'commit-01', event: 'commit', message: '📜 Another step forward.', priority: 1 },
	{ id: 'commit-02', event: 'commit', message: '🗡️ Progress, sealed in history.', priority: 1 },

	{ id: 'long-session-01', event: 'longSession', message: '😤 Your focus is becoming dangerous.', priority: 1 },
	{ id: 'long-session-02', event: 'longSession', message: '🌙 The battle rages on. Remember to rest.', priority: 1 },

	{ id: 'return-01', event: 'returnAfterInactivity', message: '⚔️ Back to the battlefield.', priority: 1 },
	{ id: 'return-02', event: 'returnAfterInactivity', message: '🌅 Another day. Another quest.', priority: 1 }
];
