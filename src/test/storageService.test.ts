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
});
