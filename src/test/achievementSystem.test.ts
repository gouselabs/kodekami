import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAchievements, isUnlocked } from '../core/achievementSystem';
import { createDefaultProfile } from '../core/types';

describe('evaluateAchievements', () => {
	test('unlocks First Blood on the very first evaluation', () => {
		const profile = createDefaultProfile();
		const { profile: updated, newlyUnlocked } = evaluateAchievements(profile);

		assert.ok(newlyUnlocked.some((a) => a.id === 'first-blood'));
		assert.ok(isUnlocked(updated, 'first-blood'));
	});

	test('does not unlock Code Warrior below level 25', () => {
		const profile = { ...createDefaultProfile(), level: 24 };
		const { newlyUnlocked } = evaluateAchievements(profile);

		assert.ok(!newlyUnlocked.some((a) => a.id === 'code-warrior'));
	});

	test('unlocks Code Warrior at level 25', () => {
		const profile = { ...createDefaultProfile(), level: 25, achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile);

		assert.ok(newlyUnlocked.some((a) => a.id === 'code-warrior'));
	});

	test('grants the XP reward and reflects any resulting level-up', () => {
		const profile = { ...createDefaultProfile(), level: 25, achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { profile: updated, leveledUpTo } = evaluateAchievements(profile);
		const codeWarrior = updated.achievements.find((a) => a.id === 'code-warrior');

		assert.ok(codeWarrior);
		assert.ok(updated.totalXp > profile.totalXp, 'XP reward was applied');
		assert.ok(Array.isArray(leveledUpTo));
	});

	test('does not unlock Night Owl outside the configured hour window', () => {
		const profile = createDefaultProfile();
		const { newlyUnlocked } = evaluateAchievements(profile, { hour: 14 });

		assert.ok(!newlyUnlocked.some((a) => a.id === 'night-owl'));
	});

	test('unlocks Night Owl inside the configured hour window', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { hour: 2 });

		assert.ok(newlyUnlocked.some((a) => a.id === 'night-owl'));
	});

	test('duplicate prevention: an already-unlocked achievement never unlocks again', () => {
		const profile = {
			...createDefaultProfile(),
			level: 25,
			achievements: [
				{ id: 'first-blood', unlockedAt: 'x' },
				{ id: 'code-warrior', unlockedAt: 'y' }
			]
		};
		const totalXpBefore = profile.totalXp;
		const { profile: updated, newlyUnlocked } = evaluateAchievements(profile, { hour: 12 });

		assert.equal(newlyUnlocked.length, 0);
		assert.equal(updated.achievements.length, 2, 'no duplicate achievement entries were added');
		assert.equal(updated.totalXp, totalXpBefore, 'no XP was re-granted for an already-unlocked achievement');
	});
});
