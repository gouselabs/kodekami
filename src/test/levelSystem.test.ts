import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { xpRequiredForLevel, getTitleForLevel, applyXp } from '../core/levelSystem';
import { createDefaultProfile } from '../core/types';

describe('xpRequiredForLevel', () => {
	test('increases as level increases', () => {
		const level1 = xpRequiredForLevel(1);
		const level2 = xpRequiredForLevel(2);
		const level10 = xpRequiredForLevel(10);

		assert.ok(level2 > level1);
		assert.ok(level10 > level2);
	});

	test('is deterministic for a given level', () => {
		assert.equal(xpRequiredForLevel(5), xpRequiredForLevel(5));
	});
});

describe('getTitleForLevel', () => {
	test('returns Beginner below the first threshold', () => {
		assert.equal(getTitleForLevel(1), 'Beginner');
		assert.equal(getTitleForLevel(9), 'Beginner');
	});

	test('returns the title exactly at each threshold', () => {
		assert.equal(getTitleForLevel(10), 'Apprentice');
		assert.equal(getTitleForLevel(25), 'Warrior');
		assert.equal(getTitleForLevel(50), 'Elite Warrior');
		assert.equal(getTitleForLevel(75), 'Master');
		assert.equal(getTitleForLevel(100), 'Legend');
	});

	test('returns the highest applicable title between thresholds', () => {
		assert.equal(getTitleForLevel(24), 'Apprentice');
		assert.equal(getTitleForLevel(49), 'Warrior');
		assert.equal(getTitleForLevel(999), 'Legend');
	});
});

describe('applyXp', () => {
	test('adds XP without leveling up when below the threshold', () => {
		const profile = createDefaultProfile();
		const requiredForLevel1 = xpRequiredForLevel(1);
		const { profile: updated, leveledUpTo } = applyXp(profile, requiredForLevel1 - 1);

		assert.equal(updated.level, 1);
		assert.equal(updated.xp, requiredForLevel1 - 1);
		assert.equal(updated.totalXp, requiredForLevel1 - 1);
		assert.deepEqual(leveledUpTo, []);
	});

	test('levels up exactly once when XP meets the threshold', () => {
		const profile = createDefaultProfile();
		const requiredForLevel1 = xpRequiredForLevel(1);
		const { profile: updated, leveledUpTo } = applyXp(profile, requiredForLevel1);

		assert.equal(updated.level, 2);
		assert.equal(updated.xp, 0);
		assert.deepEqual(leveledUpTo, [2]);
	});

	test('levels up multiple times from a single large XP grant', () => {
		const profile = createDefaultProfile();
		const bigGrant = xpRequiredForLevel(1) + xpRequiredForLevel(2) + 10;
		const { profile: updated, leveledUpTo } = applyXp(profile, bigGrant);

		assert.equal(updated.level, 3);
		assert.equal(updated.xp, 10);
		assert.deepEqual(leveledUpTo, [2, 3]);
	});

	test('always accumulates totalXp regardless of level-ups', () => {
		const profile = { ...createDefaultProfile(), totalXp: 500 };
		const { profile: updated } = applyXp(profile, 50);

		assert.equal(updated.totalXp, 550);
	});
});
