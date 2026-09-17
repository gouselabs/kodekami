import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { applyDailyStreak } from '../core/streakSystem';
import { createDefaultProfile } from '../core/types';

describe('applyDailyStreak', () => {
	test('first day of activity starts the streak at 1', () => {
		const profile = createDefaultProfile();
		const { profile: updated, incremented } = applyDailyStreak(profile, '2026-01-01');

		assert.equal(incremented, true);
		assert.equal(updated.streak, 1);
		assert.equal(updated.longestStreak, 1);
		assert.equal(updated.lastActiveDate, '2026-01-01');
	});

	test('consecutive day increments the streak', () => {
		const profile = { ...createDefaultProfile(), streak: 4, longestStreak: 4, lastActiveDate: '2026-01-01' };
		const { profile: updated, incremented } = applyDailyStreak(profile, '2026-01-02');

		assert.equal(incremented, true);
		assert.equal(updated.streak, 5);
		assert.equal(updated.longestStreak, 5);
	});

	test('missed day resets the streak to 1', () => {
		const profile = { ...createDefaultProfile(), streak: 10, longestStreak: 10, lastActiveDate: '2026-01-01' };
		const { profile: updated, incremented } = applyDailyStreak(profile, '2026-01-05');

		assert.equal(incremented, true);
		assert.equal(updated.streak, 1);
		assert.equal(updated.longestStreak, 10, 'longest streak record is preserved even after a reset');
	});

	test('same-day activity does not change the streak', () => {
		const profile = { ...createDefaultProfile(), streak: 3, longestStreak: 3, lastActiveDate: '2026-01-01' };
		const { profile: updated, incremented } = applyDailyStreak(profile, '2026-01-01');

		assert.equal(incremented, false);
		assert.equal(updated.streak, 3);
		assert.equal(updated, profile, 'returns the same profile reference when nothing changed');
	});

	test('longestStreak updates once the current streak surpasses it', () => {
		const profile = { ...createDefaultProfile(), streak: 5, longestStreak: 5, lastActiveDate: '2026-01-01' };
		const { profile: updated } = applyDailyStreak(profile, '2026-01-02');

		assert.equal(updated.streak, 6);
		assert.equal(updated.longestStreak, 6);
	});

	test('reports a milestone when the streak lands on one', () => {
		const profile = { ...createDefaultProfile(), streak: 2, longestStreak: 2, lastActiveDate: '2026-01-01' };
		const { milestone } = applyDailyStreak(profile, '2026-01-02');

		assert.equal(milestone, 3);
	});

	test('does not report a milestone on a non-milestone day', () => {
		const profile = { ...createDefaultProfile(), streak: 3, longestStreak: 3, lastActiveDate: '2026-01-01' };
		const { milestone } = applyDailyStreak(profile, '2026-01-02');

		assert.equal(milestone, undefined);
	});
});
