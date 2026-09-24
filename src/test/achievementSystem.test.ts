import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { evaluateAchievements, isUnlocked, checkAchievements } from '../core/achievementSystem';
import { createDefaultProfile } from '../core/types';
import { StorageService } from '../storage/storageService';

function createFakeContext(): vscode.ExtensionContext {
	const store = new Map<string, unknown>();
	const globalState = {
		get: <T>(key: string): T | undefined => store.get(key) as T | undefined,
		update: async (key: string, value: unknown): Promise<void> => {
			if (value === undefined) {
				store.delete(key);
			} else {
				store.set(key, value);
			}
		}
	};
	return { globalState } as unknown as vscode.ExtensionContext;
}

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
				{ id: 'apprentice-warrior', unlockedAt: 'y' },
				{ id: 'code-warrior', unlockedAt: 'z' }
			]
		};
		const totalXpBefore = profile.totalXp;
		const { profile: updated, newlyUnlocked } = evaluateAchievements(profile, { hour: 12 });

		assert.equal(newlyUnlocked.length, 0);
		assert.equal(updated.achievements.length, 3, 'no duplicate achievement entries were added');
		assert.equal(updated.totalXp, totalXpBefore, 'no XP was re-granted for an already-unlocked achievement');
	});

	test('unlocks Apprentice Warrior at level 10', () => {
		const profile = { ...createDefaultProfile(), level: 10, achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(newlyUnlocked.some((a) => a.id === 'apprentice-warrior'));
	});

	test('unlocks Elite Warrior at level 50', () => {
		const profile = { ...createDefaultProfile(), level: 50, achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(newlyUnlocked.some((a) => a.id === 'elite-warrior'));
	});

	test('unlocks Grandmaster at level 75', () => {
		const profile = { ...createDefaultProfile(), level: 75, achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(newlyUnlocked.some((a) => a.id === 'grandmaster'));
	});

	test('unlocks Centurion at a 100 day streak', () => {
		const profile = { ...createDefaultProfile(), streak: 100 };
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(newlyUnlocked.some((a) => a.id === 'centurion'));
	});

	test('unlocks Unbreakable at a 365 day streak', () => {
		const profile = { ...createDefaultProfile(), streak: 365 };
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(newlyUnlocked.some((a) => a.id === 'unbreakable'));
	});

	test('does not unlock streak/build/test/commit achievements below their thresholds', () => {
		const profile = { ...createDefaultProfile(), streak: 99 };
		const { newlyUnlocked } = evaluateAchievements(profile, {
			totalSuccessfulBuilds: 24,
			totalSuccessfulTests: 49,
			totalCommits: 49
		});
		assert.ok(!newlyUnlocked.some((a) => a.id === 'centurion'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'ship-it'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'test-pilot'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'committed'));
	});

	test('unlocks Ship It at 25 total successful builds', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalSuccessfulBuilds: 25 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'ship-it'));
	});

	test('unlocks Test Pilot at 50 total successful tests', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalSuccessfulTests: 50 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'test-pilot'));
	});

	test('unlocks Committed at 50 total commits', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalCommits: 50 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'committed'));
	});

	test('build/test/commit achievements default to zero when no context is given', () => {
		const profile = createDefaultProfile();
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(!newlyUnlocked.some((a) => a.id === 'ship-it'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'test-pilot'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'committed'));
	});

	test('unlocks Redemption Arc on the first recovery', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalRecoveries: 1 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'redemption-arc'));
	});

	test('does not unlock Redemption Arc with zero recoveries', () => {
		const profile = createDefaultProfile();
		const { newlyUnlocked } = evaluateAchievements(profile);
		assert.ok(!newlyUnlocked.some((a) => a.id === 'redemption-arc'));
	});

	test('unlocks Bug Slayer at 10 recoveries', () => {
		const profile = {
			...createDefaultProfile(),
			achievements: [
				{ id: 'first-blood', unlockedAt: 'x' },
				{ id: 'redemption-arc', unlockedAt: 'y' }
			]
		};
		const { newlyUnlocked } = evaluateAchievements(profile, { totalRecoveries: 10 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'bug-slayer'));
	});

	test('does not unlock Bug Slayer below 10 recoveries', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalRecoveries: 9 });
		assert.ok(!newlyUnlocked.some((a) => a.id === 'bug-slayer'));
	});

	test('a single recovery unlocks Redemption Arc but not Bug Slayer', () => {
		const profile = { ...createDefaultProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] };
		const { newlyUnlocked } = evaluateAchievements(profile, { totalRecoveries: 1 });
		assert.ok(newlyUnlocked.some((a) => a.id === 'redemption-arc'));
		assert.ok(!newlyUnlocked.some((a) => a.id === 'bug-slayer'));
	});
});

describe('checkAchievements', () => {
	test('unlocks a commit-count achievement using totals from persisted session history alone', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] });
		await storage.appendSession({
			id: 's1',
			startedAt: 0,
			endedAt: 1000,
			durationMinutes: 1,
			filesTouched: 0,
			buildAttempts: 0,
			successfulBuilds: 0,
			failedBuilds: 0,
			testRuns: 0,
			successfulTests: 0,
			failedTests: 0,
			commits: 50,
			recoveries: 0,
			xpEarned: 0,
			completed: true
		});

		const result = await checkAchievements(storage);
		assert.ok(result.newlyUnlocked.some((a) => a.id === 'committed'));
	});

	test('adds the caller-supplied in-progress counts on top of persisted totals rather than overriding them', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] });
		await storage.appendSession({
			id: 's1',
			startedAt: 0,
			endedAt: 1000,
			durationMinutes: 1,
			filesTouched: 0,
			buildAttempts: 0,
			successfulBuilds: 20,
			failedBuilds: 0,
			testRuns: 0,
			successfulTests: 0,
			failedTests: 0,
			commits: 0,
			recoveries: 0,
			xpEarned: 0,
			completed: true
		});

		// 20 already persisted + 5 from the current, not-yet-ended session = 25.
		const result = await checkAchievements(storage, { totalSuccessfulBuilds: 5 });
		assert.ok(result.newlyUnlocked.some((a) => a.id === 'ship-it'));
	});

	test('does not unlock when persisted + in-progress totals are still below the threshold', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), achievements: [{ id: 'first-blood', unlockedAt: 'x' }] });

		const result = await checkAchievements(storage, { totalSuccessfulBuilds: 24 });
		assert.ok(!result.newlyUnlocked.some((a) => a.id === 'ship-it'));
	});
});
