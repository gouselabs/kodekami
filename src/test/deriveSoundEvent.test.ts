import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { bypassesSoundCooldown, deriveSoundEvent } from '../audio/deriveSoundEvent';
import { LONG_SESSION_MINUTES } from '../core/config';
import type { CodingSession } from '../core/sessionTypes';

function makeSession(overrides: Partial<CodingSession> = {}): CodingSession {
	return {
		id: 's1',
		startedAt: 0,
		endedAt: 0,
		durationMinutes: 10,
		filesTouched: 0,
		buildAttempts: 0,
		successfulBuilds: 0,
		failedBuilds: 0,
		testRuns: 0,
		successfulTests: 0,
		failedTests: 0,
		commits: 0,
		recoveries: 0,
		xpEarned: 0,
		completed: true,
		...overrides
	};
}

describe('deriveSoundEvent', () => {
	test('levelUp maps to levelUp', () => {
		assert.equal(deriveSoundEvent({ type: 'levelUp', level: 2, title: 'Beginner' }), 'levelUp');
	});

	test('achievementUnlocked maps to achievementUnlocked', () => {
		const achievement = { id: 'x', name: 'X', description: '', icon: '', xpReward: 0, condition: () => true };
		assert.equal(deriveSoundEvent({ type: 'achievementUnlocked', achievement }), 'achievementUnlocked');
	});

	test('streakMilestone maps to streakMilestone', () => {
		assert.equal(deriveSoundEvent({ type: 'streakMilestone', milestone: 7 }), 'streakMilestone');
	});

	test('commit maps to commit', () => {
		assert.equal(deriveSoundEvent({ type: 'commit' }), 'commit');
	});

	test('build success/failure map correctly', () => {
		assert.equal(deriveSoundEvent({ type: 'taskCompleted', kind: 'build', success: true }), 'buildSuccess');
		assert.equal(deriveSoundEvent({ type: 'taskCompleted', kind: 'build', success: false }), 'buildFailure');
	});

	test('test success/failure map correctly', () => {
		assert.equal(deriveSoundEvent({ type: 'taskCompleted', kind: 'test', success: true }), 'testSuccess');
		assert.equal(deriveSoundEvent({ type: 'taskCompleted', kind: 'test', success: false }), 'testFailure');
	});

	test('unknown task kind maps to no sound', () => {
		assert.equal(deriveSoundEvent({ type: 'taskCompleted', kind: 'unknown', success: true }), undefined);
	});

	test('long session maps to longSession, short session does not', () => {
		assert.equal(
			deriveSoundEvent({ type: 'sessionEnded', session: makeSession({ durationMinutes: LONG_SESSION_MINUTES }) }),
			'longSession'
		);
		assert.equal(
			deriveSoundEvent({ type: 'sessionEnded', session: makeSession({ durationMinutes: LONG_SESSION_MINUTES - 1 }) }),
			undefined
		);
	});

	test('returning session start maps to returnAfterInactivity, first-ever does not', () => {
		assert.equal(deriveSoundEvent({ type: 'sessionStarted', isReturn: true }), 'returnAfterInactivity');
		assert.equal(deriveSoundEvent({ type: 'sessionStarted', isReturn: false }), undefined);
	});

	test('xpGranted has no sound of its own', () => {
		assert.equal(deriveSoundEvent({ type: 'xpGranted', result: { leveledUpTo: [] }, context: {} }), undefined);
	});
});

describe('bypassesSoundCooldown', () => {
	test('levelUp and achievementUnlocked bypass the cooldown', () => {
		assert.equal(bypassesSoundCooldown('levelUp'), true);
		assert.equal(bypassesSoundCooldown('achievementUnlocked'), true);
	});

	test('all other sound events respect the cooldown', () => {
		const gated: Array<Parameters<typeof bypassesSoundCooldown>[0]> = [
			'buildSuccess',
			'buildFailure',
			'testSuccess',
			'testFailure',
			'commit',
			'longSession',
			'returnAfterInactivity',
			'streakMilestone'
		];
		for (const soundEvent of gated) {
			assert.equal(bypassesSoundCooldown(soundEvent), false, `expected ${soundEvent} to respect the cooldown`);
		}
	});
});
