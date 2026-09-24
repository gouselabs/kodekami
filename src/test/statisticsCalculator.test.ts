import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyActivity, calculatePeriodStatistics, startOfLocalDay } from '../analytics/StatisticsCalculator';
import type { CodingSession } from '../core/sessionTypes';
import type { AchievementState } from '../core/types';

function makeSession(overrides: Partial<CodingSession> = {}): CodingSession {
	return {
		id: 'session-test',
		startedAt: 0,
		endedAt: 0,
		durationMinutes: 10,
		filesTouched: 2,
		buildAttempts: 2,
		successfulBuilds: 1,
		failedBuilds: 1,
		testRuns: 4,
		successfulTests: 3,
		failedTests: 1,
		commits: 1,
		recoveries: 0,
		xpEarned: 20,
		completed: true,
		...overrides
	};
}

describe('calculatePeriodStatistics', () => {
	test('sums fields only for sessions ending within the window', () => {
		const sessions = [
			makeSession({ endedAt: 1000, xpEarned: 10 }),
			makeSession({ endedAt: 5000, xpEarned: 20 }),
			makeSession({ endedAt: 9000, xpEarned: 30 }) // outside window
		];

		const stats = calculatePeriodStatistics(sessions, [], 0, 6000);

		assert.equal(stats.sessions, 2);
		assert.equal(stats.xpEarned, 30);
	});

	test('includes sessions exactly at the window boundaries', () => {
		const sessions = [makeSession({ endedAt: 0 }), makeSession({ endedAt: 6000 })];
		const stats = calculatePeriodStatistics(sessions, [], 0, 6000);
		assert.equal(stats.sessions, 2);
	});

	test('returns all zeros for an empty session list', () => {
		const stats = calculatePeriodStatistics([], [], 0, 1000);
		assert.equal(stats.sessions, 0);
		assert.equal(stats.codingMinutes, 0);
		assert.equal(stats.xpEarned, 0);
	});

	test('counts achievements unlocked within the window', () => {
		const achievements: AchievementState[] = [
			{ id: 'a', unlockedAt: new Date(1000).toISOString() },
			{ id: 'b', unlockedAt: new Date(9000).toISOString() } // outside window
		];

		const stats = calculatePeriodStatistics([], achievements, 0, 6000);
		assert.equal(stats.achievementsUnlocked, 1);
	});

	test('aggregates build and test breakdowns correctly', () => {
		const sessions = [makeSession({ endedAt: 1000 }), makeSession({ endedAt: 2000 })];
		const stats = calculatePeriodStatistics(sessions, [], 0, 3000);
		assert.equal(stats.buildAttempts, 4);
		assert.equal(stats.successfulBuilds, 2);
		assert.equal(stats.failedBuilds, 2);
		assert.equal(stats.testRuns, 8);
	});
});

describe('calculateDailyActivity', () => {
	test('returns one bucket per requested day, zero-filled when no sessions', () => {
		const buckets = calculateDailyActivity([], 7, Date.now());
		assert.equal(buckets.length, 7);
		assert.ok(buckets.every((b) => b.codingMinutes === 0 && b.xpEarned === 0));
	});

	test('buckets are ordered oldest to newest, ending on the current day', () => {
		const now = new Date(2026, 0, 10).getTime(); // Jan 10, 2026 local
		const buckets = calculateDailyActivity([], 3, now);
		assert.deepEqual(
			buckets.map((b) => b.date),
			['2026-01-08', '2026-01-09', '2026-01-10']
		);
	});

	test('assigns a session to the local date it ended on', () => {
		const now = new Date(2026, 0, 10, 12, 0, 0).getTime();
		const sessionEndedToday = new Date(2026, 0, 10, 9, 0, 0).getTime();

		const sessions = [makeSession({ endedAt: sessionEndedToday, durationMinutes: 45, xpEarned: 12 })];
		const buckets = calculateDailyActivity(sessions, 3, now);

		const today = buckets.find((b) => b.date === '2026-01-10');
		assert.ok(today);
		assert.equal(today.codingMinutes, 45);
		assert.equal(today.xpEarned, 12);
	});

	test('ignores sessions outside the requested day range', () => {
		const now = new Date(2026, 0, 10).getTime();
		const longAgo = new Date(2025, 0, 1).getTime();

		const sessions = [makeSession({ endedAt: longAgo, durationMinutes: 999 })];
		const buckets = calculateDailyActivity(sessions, 3, now);

		assert.ok(buckets.every((b) => b.codingMinutes === 0));
	});
});

describe('startOfLocalDay', () => {
	test('returns midnight local time for the given date', () => {
		const start = startOfLocalDay(new Date(2026, 0, 15, 18, 30, 0));
		const expected = new Date(2026, 0, 15, 0, 0, 0, 0).getTime();
		assert.equal(start, expected);
	});

	test('"today" statistics only include sessions ending after local midnight', () => {
		const now = new Date(2026, 0, 15, 14, 0, 0);
		const since = startOfLocalDay(now);

		const sessions = [
			makeSession({ endedAt: new Date(2026, 0, 15, 1, 0, 0).getTime(), xpEarned: 5 }), // today, early morning
			makeSession({ endedAt: new Date(2026, 0, 14, 23, 0, 0).getTime(), xpEarned: 50 }) // yesterday, late night
		];

		const stats = calculatePeriodStatistics(sessions, [], since, now.getTime());
		assert.equal(stats.sessions, 1);
		assert.equal(stats.xpEarned, 5);
	});
});
