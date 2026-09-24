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
		recoveries: 0,
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

	test('a streak milestone maps to achievement mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'streakMilestone', milestone: 7 }), 'achievement');
	});

	test('a commit maps to coding mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'commit' }), 'coding');
	});

	test('xpGranted maps to no mood', () => {
		assert.equal(deriveMoodFromEvent({ type: 'xpGranted', result: { leveledUpTo: [] }, context: {} }), undefined);
	});

	test('focusStarted maps to focusMode', () => {
		assert.equal(deriveMoodFromEvent({ type: 'focusStarted', targetDurationMinutes: 25 }), 'focusMode');
	});

	test('focusCompleted maps to achievement', () => {
		const session = { startedAt: 0, endedAt: 1, targetDurationMinutes: 25, elapsedMinutes: 25, outcome: 'completed' as const, xpEarned: 75 };
		assert.equal(deriveMoodFromEvent({ type: 'focusCompleted', session }), 'achievement');
	});

	test('focusCancelled maps to no mood', () => {
		const session = { startedAt: 0, endedAt: 1, targetDurationMinutes: 25, elapsedMinutes: 5, outcome: 'cancelled' as const, xpEarned: 0 };
		assert.equal(deriveMoodFromEvent({ type: 'focusCancelled', session }), undefined);
	});
});
