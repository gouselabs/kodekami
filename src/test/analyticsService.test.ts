import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { buildAnalyticsSnapshot } from '../analytics/AnalyticsService';

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

describe('buildAnalyticsSnapshot', () => {
	test('returns empty stats and a full daily-activity window with no session history', () => {
		const storage = new StorageService(createFakeContext());
		const snapshot = buildAnalyticsSnapshot(storage, Date.now());

		assert.equal(snapshot.weekly.sessions, 0);
		assert.equal(snapshot.monthly.sessions, 0);
		assert.equal(snapshot.dailyActivity.length, 14);
	});

	test('includes a recent session in both weekly and monthly stats', async () => {
		const storage = new StorageService(createFakeContext());
		const now = Date.now();
		await storage.appendSession({
			id: 's1',
			startedAt: now - 60_000,
			endedAt: now,
			durationMinutes: 30,
			filesTouched: 3,
			buildAttempts: 1,
			successfulBuilds: 1,
			failedBuilds: 0,
			testRuns: 2,
			successfulTests: 2,
			failedTests: 0,
			commits: 1,
			xpEarned: 15,
			completed: true
		});

		const snapshot = buildAnalyticsSnapshot(storage, now);

		assert.equal(snapshot.weekly.sessions, 1);
		assert.equal(snapshot.weekly.xpEarned, 15);
		assert.equal(snapshot.monthly.sessions, 1);
	});

	test('excludes a session older than 30 days from monthly stats', async () => {
		const storage = new StorageService(createFakeContext());
		const now = Date.now();
		const thirtyFiveDaysAgo = now - 35 * 24 * 60 * 60 * 1000;
		await storage.appendSession({
			id: 's1',
			startedAt: thirtyFiveDaysAgo,
			endedAt: thirtyFiveDaysAgo,
			durationMinutes: 30,
			filesTouched: 3,
			buildAttempts: 0,
			successfulBuilds: 0,
			failedBuilds: 0,
			testRuns: 0,
			successfulTests: 0,
			failedTests: 0,
			commits: 0,
			xpEarned: 15,
			completed: true
		});

		const snapshot = buildAnalyticsSnapshot(storage, now);
		assert.equal(snapshot.monthly.sessions, 0);
	});
});
