import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deriveMoodFromEvent, getMoodEmoji } from '../companion/CompanionMood';
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
		xpEarned: 0,
		completed: true,
		...overrides
	};
}

describe('getMoodEmoji', () => {
	test('returns a non-empty emoji for every mood', () => {
		const moods = [
			'idle',
			'coding',
			'buildSuccess',
			'buildFailure',
			'testSuccess',
			'testFailure',
			'levelUp',
			'achievement',
			'longSession',
			'inactive',
			'focusMode',
			'comeback'
		] as const;
		for (const mood of moods) {
			assert.ok(getMoodEmoji(mood).length > 0, `expected an emoji for ${mood}`);
		}
	});
});

describe('deriveMoodFromEvent', () => {
	test('levelUp event maps to levelUp mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'levelUp', level: 2, title: 'Beginner' }), 'levelUp');
	});

	test('achievementUnlocked event maps to achievement mood', () => {
		const achievement = { id: 'x', name: 'X', description: '', icon: '', xpReward: 0, condition: () => true };
		assert.equal(deriveMoodFromEvent({ type: 'achievementUnlocked', achievement }), 'achievement');
	});

	test('successful build task maps to buildSuccess', () => {
		assert.equal(deriveMoodFromEvent({ type: 'taskCompleted', kind: 'build', success: true }), 'buildSuccess');
	});

	test('failed build task maps to buildFailure', () => {
		assert.equal(deriveMoodFromEvent({ type: 'taskCompleted', kind: 'build', success: false }), 'buildFailure');
	});

	test('successful test task maps to testSuccess', () => {
		assert.equal(deriveMoodFromEvent({ type: 'taskCompleted', kind: 'test', success: true }), 'testSuccess');
	});

	test('failed test task maps to testFailure', () => {
		assert.equal(deriveMoodFromEvent({ type: 'taskCompleted', kind: 'test', success: false }), 'testFailure');
	});

	test('unknown task kind maps to no mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'taskCompleted', kind: 'unknown', success: true }), undefined);
	});

	test('a long session maps to longSession mood', () => {
		const session = makeSession({ durationMinutes: LONG_SESSION_MINUTES });
		assert.equal(deriveMoodFromEvent({ type: 'sessionEnded', session }), 'longSession');
	});

	test('a short session maps to no mood', () => {
		const session = makeSession({ durationMinutes: LONG_SESSION_MINUTES - 1 });
		assert.equal(deriveMoodFromEvent({ type: 'sessionEnded', session }), undefined);
	});

	test('a returning session start maps to comeback mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'sessionStarted', isReturn: true }), 'comeback');
	});

	test('a first-ever session start maps to no mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'sessionStarted', isReturn: false }), undefined);
	});

	test('unrelated events map to no mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'streakMilestone', milestone: 7 }), undefined);
		assert.equal(deriveMoodFromEvent({ type: 'commit' }), undefined);
	});
});
