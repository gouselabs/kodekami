import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { getCurrentTheme } from '../themes/ThemeService';
import { DEFAULT_THEME_ID } from '../themes/themes';

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

describe('getCurrentTheme', () => {
	test('returns the default theme when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		const theme = getCurrentTheme(storage);
		assert.equal(theme.id, DEFAULT_THEME_ID);
	});

	test('returns the selected theme once the level requirement is met', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), level: 10 });
		await storage.saveThemeSelection({ version: 1, selectedThemeId: 'void-realm' });

		const theme = getCurrentTheme(storage);
		assert.equal(theme.id, 'void-realm');
	});

	test('falls back to the default theme if the selected theme is not yet unlocked', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), level: 1 });
		await storage.saveThemeSelection({ version: 1, selectedThemeId: 'void-realm' });

		const theme = getCurrentTheme(storage);
		assert.equal(theme.id, DEFAULT_THEME_ID, 'level 1 has not unlocked Void Realm (level 10)');
	});

	test('falls back to the default theme if the stored theme id is unknown', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveThemeSelection({ version: 1, selectedThemeId: 'not-a-real-theme' });

		const theme = getCurrentTheme(storage);
		assert.equal(theme.id, DEFAULT_THEME_ID);
	});
});
