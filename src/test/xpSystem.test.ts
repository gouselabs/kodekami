import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { grantXp } from '../core/xpSystem';
import { xpRequiredForLevel } from '../core/levelSystem';

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

describe('grantXp', () => {
	test('persists granted XP to storage', async () => {
		const storage = new StorageService(createFakeContext());
		await grantXp(storage, 10);

		assert.equal(storage.getProfile().xp, 10);
		assert.equal(storage.getProfile().totalXp, 10);
	});

	test('reports level-ups and persists the new level', async () => {
		const storage = new StorageService(createFakeContext());
		const { leveledUpTo } = await grantXp(storage, xpRequiredForLevel(1));

		assert.deepEqual(leveledUpTo, [2]);
		assert.equal(storage.getProfile().level, 2);
	});

	test('accumulates across multiple grants', async () => {
		const storage = new StorageService(createFakeContext());
		await grantXp(storage, 5);
		await grantXp(storage, 7);

		assert.equal(storage.getProfile().totalXp, 12);
	});
});
