import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { PROFILE_VERSION } from '../core/types';

function createFakeContext(initial?: Record<string, unknown>): vscode.ExtensionContext {
	const store = new Map<string, unknown>(Object.entries(initial ?? {}));

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

describe('StorageService', () => {
	test('getProfile returns a default profile when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		const profile = storage.getProfile();

		assert.equal(profile.level, 1);
		assert.equal(profile.xp, 0);
		assert.equal(profile.characterClass, null);
		assert.deepEqual(profile.achievements, []);
		assert.equal(profile.version, PROFILE_VERSION);
	});

	test('saveProfile then getProfile round-trips the data', async () => {
		const storage = new StorageService(createFakeContext());
		const profile = storage.getProfile();
		const updated = { ...profile, level: 7, xp: 42, characterClass: 'Ninja' };

		await storage.saveProfile(updated);
		const reloaded = storage.getProfile();

		assert.equal(reloaded.level, 7);
		assert.equal(reloaded.xp, 42);
		assert.equal(reloaded.characterClass, 'Ninja');
	});

	test('migrates a v1 profile (missing achievements and cardName) forward', () => {
		const storage = new StorageService(
			createFakeContext({
				'codekami.profile': {
					version: 1,
					characterClass: 'Samurai',
					level: 3,
					xp: 10,
					totalXp: 310,
					streak: 2,
					longestStreak: 2,
					lastActiveDate: '2026-01-01'
					// achievements and cardName intentionally absent, as a real v1 profile would be
				}
			})
		);

		const profile = storage.getProfile();

		assert.equal(profile.version, PROFILE_VERSION);
		assert.deepEqual(profile.achievements, []);
		assert.equal(profile.cardName, null);
		assert.equal(profile.level, 3, 'existing data is preserved through migration');
		assert.equal(profile.characterClass, 'Samurai');
	});

	test('resetProfile clears stored data back to defaults', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), level: 50 });

		assert.equal(storage.getProfile().level, 50);

		await storage.resetProfile();

		assert.equal(storage.getProfile().level, 1);
	});

	test('getSessionHistory returns an empty default history when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		const history = storage.getSessionHistory();

		assert.deepEqual(history.sessions, []);
		assert.equal(history.historicalAggregate.totalSessions, 0);
	});

	test('appendSession persists a session and it is retrievable', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.appendSession({
			id: 's1',
			startedAt: 0,
			endedAt: 60_000,
			durationMinutes: 1,
			filesTouched: 1,
			buildAttempts: 0,
			successfulBuilds: 0,
			failedBuilds: 0,
			testRuns: 0,
			successfulTests: 0,
			failedTests: 0,
			commits: 0,
			xpEarned: 5,
			completed: true
		});

		const history = storage.getSessionHistory();
		assert.equal(history.sessions.length, 1);
		assert.equal(history.sessions[0].id, 's1');
	});

	test('resetSessionHistory clears stored session data back to defaults', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.appendSession({
			id: 's1',
			startedAt: 0,
			endedAt: 60_000,
			durationMinutes: 1,
			filesTouched: 1,
			buildAttempts: 0,
			successfulBuilds: 0,
			failedBuilds: 0,
			testRuns: 0,
			successfulTests: 0,
			failedTests: 0,
			commits: 0,
			xpEarned: 5,
			completed: true
		});
		assert.equal(storage.getSessionHistory().sessions.length, 1);

		await storage.resetSessionHistory();

		assert.equal(storage.getSessionHistory().sessions.length, 0);
	});

	test('getCompanionState returns Cyber Fox unlocked and selected by default', () => {
		const storage = new StorageService(createFakeContext());
		const state = storage.getCompanionState();

		assert.equal(state.selectedCompanionId, 'cyber-fox');
		assert.deepEqual(state.unlockedCompanionIds, ['cyber-fox']);
	});

	test('saveCompanionState then getCompanionState round-trips the data', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveCompanionState({
			version: 1,
			selectedCompanionId: 'cyber-fox',
			unlockedCompanionIds: ['cyber-fox', 'spirit-dragon']
		});

		const state = storage.getCompanionState();
		assert.deepEqual(state.unlockedCompanionIds, ['cyber-fox', 'spirit-dragon']);
	});

	test('resetCompanionState clears stored companion data back to defaults', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveCompanionState({
			version: 1,
			selectedCompanionId: 'cyber-fox',
			unlockedCompanionIds: ['cyber-fox', 'spirit-dragon']
		});

		await storage.resetCompanionState();

		assert.deepEqual(storage.getCompanionState().unlockedCompanionIds, ['cyber-fox']);
	});

	test('getThemeSelection defaults to Default Cyber when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		assert.equal(storage.getThemeSelection().selectedThemeId, 'default-cyber');
	});

	test('saveThemeSelection then getThemeSelection round-trips the data', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveThemeSelection({ version: 1, selectedThemeId: 'neon-city' });

		assert.equal(storage.getThemeSelection().selectedThemeId, 'neon-city');
	});

	test('resetThemeSelection clears stored theme data back to the default', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveThemeSelection({ version: 1, selectedThemeId: 'neon-city' });

		await storage.resetThemeSelection();

		assert.equal(storage.getThemeSelection().selectedThemeId, 'default-cyber');
	});
});
