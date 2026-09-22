export type SoundEvent =
	| 'levelUp'
	| 'achievementUnlocked'
	| 'buildSuccess'
	| 'buildFailure'
	| 'testSuccess'
	| 'testFailure'
	| 'commit'
	| 'longSession'
	| 'returnAfterInactivity'
	| 'streakMilestone';

export const SOUND_FILES: Readonly<Record<SoundEvent, string>> = {
	levelUp: 'level-up.wav',
	achievementUnlocked: 'achievement.wav',
	buildSuccess: 'build-success.wav',
	buildFailure: 'build-failure.wav',
	testSuccess: 'test-success.wav',
	testFailure: 'test-failure.wav',
	commit: 'commit.wav',
	longSession: 'long-session.wav',
	returnAfterInactivity: 'comeback.wav',
	streakMilestone: 'streak-milestone.wav'
};
