import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { appendSession } from '../core/sessionHistory';
import { createDefaultSessionHistory } from '../core/sessionTypes';
import type { CodingSession } from '../core/sessionTypes';

function makeSession(overrides: Partial<CodingSession> = {}): CodingSession {
	return {
		id: 'session-test',
		startedAt: 0,
		endedAt: 60_000,
		durationMinutes: 10,
		filesTouched: 2,
		buildAttempts: 1,
		successfulBuilds: 1,
		failedBuilds: 0,
		testRuns: 3,
		successfulTests: 3,
		failedTests: 0,
		commits: 1,
		xpEarned: 20,
		completed: true,
		...overrides
	};
}

describe('appendSession', () => {
	test('adds a session to an empty history', () => {
		const history = appendSession(createDefaultSessionHistory(), makeSession());
		assert.equal(history.sessions.length, 1);
		assert.equal(history.historicalAggregate.totalSessions, 0, 'no overflow yet, nothing aggregated');
	});

	test('does not aggregate while under the cap', () => {
		let history = createDefaultSessionHistory();
		for (let i = 0; i < 10; i++) {
			history = appendSession(history, makeSession({ id: `s${i}` }));
		}
		assert.equal(history.sessions.length, 10);
		assert.equal(history.historicalAggregate.totalSessions, 0);
	});

	test('folds the oldest session into the aggregate once over the cap', () => {
		let history = createDefaultSessionHistory();
		// Fill exactly to the cap (500) using a lightweight loop, then add one more.
		for (let i = 0; i < 500; i++) {
			history = appendSession(history, makeSession({ id: `s${i}`, xpEarned: 1 }));
		}
		assert.equal(history.sessions.length, 500);
		assert.equal(history.historicalAggregate.totalSessions, 0);

		history = appendSession(history, makeSession({ id: 'overflow', xpEarned: 1 }));

		assert.equal(history.sessions.length, 500, 'stays capped at 500');
		assert.equal(history.historicalAggregate.totalSessions, 1, 'exactly one session folded');
		assert.equal(history.sessions[0].id, 's1', 'oldest (s0) was dropped, s1 is now first');
	});

	test('aggregate accumulates stats correctly across multiple folds', () => {
		let history = createDefaultSessionHistory();
		for (let i = 0; i < 502; i++) {
			history = appendSession(history, makeSession({ id: `s${i}`, xpEarned: 5 }));
		}
		assert.equal(history.sessions.length, 500);
		assert.equal(history.historicalAggregate.totalSessions, 2);
		assert.equal(history.historicalAggregate.totalXpEarned, 10);
	});
});
