import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FocusTimer } from '../focus/FocusTimer';

describe('FocusTimer', () => {
	test('getRemainingMs counts down from the full target duration', () => {
		const timer = new FocusTimer(0, 25);
		assert.equal(timer.getRemainingMs(0), 25 * 60_000);
		assert.equal(timer.getRemainingMs(60_000), 24 * 60_000);
	});

	test('getRemainingMs never goes negative once past the target', () => {
		const timer = new FocusTimer(0, 25);
		assert.equal(timer.getRemainingMs(999 * 60_000), 0);
	});

	test('isDue is false before the target duration elapses and true at/after it', () => {
		const timer = new FocusTimer(0, 25);
		assert.equal(timer.isDue(25 * 60_000 - 1), false);
		assert.equal(timer.isDue(25 * 60_000), true);
		assert.equal(timer.isDue(25 * 60_000 + 1), true);
	});

	test('getBossHpPercent starts at 100 and reaches 0 exactly when due', () => {
		const timer = new FocusTimer(0, 10, 'bug-hydra');
		assert.equal(timer.getBossHpPercent(0), 100);
		assert.equal(timer.getBossHpPercent(5 * 60_000), 50);
		assert.equal(timer.getBossHpPercent(10 * 60_000), 0);
		assert.equal(timer.getBossHpPercent(15 * 60_000), 0, 'never goes negative past due');
	});

	test('getElapsedMinutes tracks time since start', () => {
		const timer = new FocusTimer(0, 25);
		assert.equal(timer.getElapsedMinutes(90_000), 1.5);
	});

	test('finalize with outcome completed grants XP proportional to elapsed minutes', () => {
		const timer = new FocusTimer(0, 25);
		const session = timer.finalize(25 * 60_000, 'completed', 3);
		assert.equal(session.elapsedMinutes, 25);
		assert.equal(session.xpEarned, 75);
		assert.equal(session.outcome, 'completed');
	});

	test('finalize with outcome cancelled grants zero XP regardless of elapsed time', () => {
		const timer = new FocusTimer(0, 25);
		const session = timer.finalize(20 * 60_000, 'cancelled', 3);
		assert.equal(session.xpEarned, 0);
		assert.equal(session.outcome, 'cancelled');
	});

	test('finalize with outcome manualWin grants XP for the time actually spent, not the full target', () => {
		const timer = new FocusTimer(0, 60);
		const session = timer.finalize(10 * 60_000, 'manualWin', 3);
		assert.equal(session.elapsedMinutes, 10);
		assert.equal(session.xpEarned, 30);
		assert.equal(session.outcome, 'manualWin');
	});

	test('finalize preserves the boss id when present', () => {
		const timer = new FocusTimer(0, 25, 'deadline-dragon');
		const session = timer.finalize(25 * 60_000, 'completed', 3);
		assert.equal(session.bossId, 'deadline-dragon');
	});

	test('finalize leaves bossId undefined for plain focus sessions', () => {
		const timer = new FocusTimer(0, 25);
		const session = timer.finalize(25 * 60_000, 'completed', 3);
		assert.equal(session.bossId, undefined);
	});

	test('finalize records startedAt and endedAt', () => {
		const timer = new FocusTimer(1000, 25);
		const session = timer.finalize(1000 + 25 * 60_000, 'completed', 3);
		assert.equal(session.startedAt, 1000);
		assert.equal(session.endedAt, 1000 + 25 * 60_000);
	});
});
