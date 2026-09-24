import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { appendSession, computeAllTimeSessionTotals } from '../core/sessionHistory';
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
		recoveries: 0,
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

describe('computeAllTimeSessionTotals', () => {
	test('sums totals across all currently-stored sessions', () => {
		let history = createDefaultSessionHistory();
		history = appendSession(history, makeSession({ id: 's1', commits: 2, successfulBuilds: 3, successfulTests: 4 }));
		history = appendSession(history, makeSession({ id: 's2', commits: 1, successfulBuilds: 1, successfulTests: 1 }));

		const totals = computeAllTimeSessionTotals(history);
		assert.equal(totals.totalCommits, 3);
		assert.equal(totals.totalSuccessfulBuilds, 4);
		assert.equal(totals.totalSuccessfulTests, 5);
	});

	test('includes totals from sessions already folded into the historical aggregate', () => {
		let history = createDefaultSessionHistory();
		for (let i = 0; i < 501; i++) {
			history = appendSession(history, makeSession({ id: `s${i}`, commits: 1, successfulBuilds: 1, successfulTests: 1 }));
		}

		// 1 session folded into the aggregate, 500 still in the live list — all 501 must count.
		const totals = computeAllTimeSessionTotals(history);
		assert.equal(totals.totalCommits, 501);
		assert.equal(totals.totalSuccessfulBuilds, 501);
		assert.equal(totals.totalSuccessfulTests, 501);
	});

	test('returns all zeros for an empty history', () => {
		const totals = computeAllTimeSessionTotals(createDefaultSessionHistory());
		assert.equal(totals.totalCommits, 0);
		assert.equal(totals.totalSuccessfulBuilds, 0);
		assert.equal(totals.totalSuccessfulTests, 0);
		assert.equal(totals.totalRecoveries, 0);
	});

	test('includes recoveries from both live sessions and the folded aggregate', () => {
		let history = createDefaultSessionHistory();
		for (let i = 0; i < 501; i++) {
			history = appendSession(history, makeSession({ id: `s${i}`, recoveries: 1 }));
		}

		const totals = computeAllTimeSessionTotals(history);
		assert.equal(totals.totalRecoveries, 501);
	});
});
