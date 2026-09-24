import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { PROFILE_VERSION } from '../core/types';
import { getLocalDateString } from '../core/streakSystem';

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

	return { globalState, extension: { packageJSON: { version: '0.1.1' } } } as unknown as vscode.ExtensionContext;
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
			recoveries: 0,
			xpEarned: 5,
			completed: true
		});

		const history = storage.getSessionHistory();
		assert.equal(history.sessions.length, 1);
		assert.equal(history.sessions[0].id, 's1');
	});

	test('migrates a v1 session history (missing recoveries) forward', () => {
		const storage = new StorageService(
			createFakeContext({
				'codekami.sessions': {
					version: 1,
					sessions: [
						{
							id: 's1',
							startedAt: 0,
							endedAt: 60_000,
							durationMinutes: 1,
							filesTouched: 1,
							buildAttempts: 1,
							successfulBuilds: 1,
							failedBuilds: 0,
							testRuns: 0,
							successfulTests: 0,
							failedTests: 0,
							commits: 0,
							xpEarned: 5,
							completed: true
							// recoveries intentionally absent, as a real v1 session would be
						}
					],
					historicalAggregate: {
						totalSessions: 2,
						totalDurationMinutes: 20,
						totalFilesTouched: 4,
						totalBuildAttempts: 2,
						totalSuccessfulBuilds: 2,
						totalFailedBuilds: 0,
						totalTestRuns: 0,
						totalSuccessfulTests: 0,
						totalFailedTests: 0,
						totalCommits: 0,
						totalXpEarned: 10
						// totalRecoveries intentionally absent
					}
				}
			})
		);

		const history = storage.getSessionHistory();

		assert.equal(history.version, 2);
		assert.equal(history.sessions[0].recoveries, 0);
		assert.equal(history.historicalAggregate.totalRecoveries, 0);
		assert.equal(history.historicalAggregate.totalSessions, 2, 'existing aggregate data is preserved through migration');
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
			recoveries: 0,
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

	test('getFocusState returns all zeros when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		const state = storage.getFocusState();

		assert.equal(state.totalCompletedSessions, 0);
		assert.equal(state.totalCancelledSessions, 0);
		assert.equal(state.totalManualWins, 0);
		assert.equal(state.totalFocusMinutes, 0);
		assert.equal(state.totalBossesDefeated, 0);
	});

	test('saveFocusState then getFocusState round-trips the data', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveFocusState({
			version: 1,
			totalCompletedSessions: 3,
			totalCancelledSessions: 1,
			totalManualWins: 1,
			totalFocusMinutes: 62,
			totalBossesDefeated: 2
		});

		const state = storage.getFocusState();
		assert.equal(state.totalCompletedSessions, 3);
		assert.equal(state.totalFocusMinutes, 62);
		assert.equal(state.totalBossesDefeated, 2);
	});

	test('resetFocusState clears stored focus data back to defaults', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveFocusState({
			version: 1,
			totalCompletedSessions: 3,
			totalCancelledSessions: 1,
			totalManualWins: 1,
			totalFocusMinutes: 62,
			totalBossesDefeated: 2
		});

		await storage.resetFocusState();

		assert.equal(storage.getFocusState().totalCompletedSessions, 0);
	});

	test('getQuestState picks a fresh selection for today when nothing is stored', () => {
		const storage = new StorageService(createFakeContext());
		const state = storage.getQuestState();

		assert.equal(state.date, getLocalDateString());
		assert.equal(state.questIds.length, 3);
		assert.deepEqual(state.completedQuestIds, []);
	});

	test('getQuestState rolls a stale stored date forward without needing an explicit save', () => {
		const storage = new StorageService(
			createFakeContext({
				'codekami.questState': {
					version: 1,
					date: '2020-01-01',
					questIds: ['commit-once'],
					completedQuestIds: ['commit-once']
				}
			})
		);

		const state = storage.getQuestState();
		assert.notEqual(state.date, '2020-01-01');
		assert.deepEqual(state.completedQuestIds, []);
	});

	test('saveQuestState then getQuestState round-trips same-day progress', async () => {
		const storage = new StorageService(createFakeContext());
		const today = storage.getQuestState();
		const withProgress = { ...today, completedQuestIds: [today.questIds[0]] };

		await storage.saveQuestState(withProgress);

		assert.deepEqual(storage.getQuestState().completedQuestIds, [today.questIds[0]]);
	});

	test('resetQuestState clears stored quest data back to a fresh selection', async () => {
		const storage = new StorageService(createFakeContext());
		const today = storage.getQuestState();
		await storage.saveQuestState({ ...today, completedQuestIds: [today.questIds[0]] });

		await storage.resetQuestState();

		assert.deepEqual(storage.getQuestState().completedQuestIds, []);
	});

	test('exportAll captures the current value of every storage domain', async () => {
		const storage = new StorageService(createFakeContext());
		await storage.saveProfile({ ...storage.getProfile(), level: 12 });

		const envelope = storage.exportAll();

		assert.equal(envelope.exportVersion, 1);
		assert.equal(envelope.data.profile.level, 12);
		assert.ok(Array.isArray(envelope.data.sessionHistory.sessions));
		assert.equal(envelope.data.companionState.selectedCompanionId, 'cyber-fox');
		assert.equal(envelope.data.themeSelection.selectedThemeId, 'default-cyber');
		assert.equal(envelope.data.focusState.totalCompletedSessions, 0);
		assert.equal(envelope.data.questState.questIds.length, 3);
	});

	test('importAll writes every domain through its normal setter, so a round-trip preserves data', async () => {
		const source = new StorageService(createFakeContext());
		await source.saveProfile({ ...source.getProfile(), level: 42, xp: 7 });
		await source.saveCompanionState({ version: 1, selectedCompanionId: 'zen-panda', unlockedCompanionIds: ['cyber-fox', 'zen-panda'] });

		const envelope = source.exportAll();

		const destination = new StorageService(createFakeContext());
		await destination.importAll(envelope);

		assert.equal(destination.getProfile().level, 42);
		assert.equal(destination.getProfile().xp, 7);
		assert.equal(destination.getCompanionState().selectedCompanionId, 'zen-panda');
	});

	test('importAll of an export from an older schema still migrates correctly', async () => {
		const destination = new StorageService(createFakeContext());
		const oldEnvelope = {
			exportVersion: 1,
			exportedAt: '2026-01-01T00:00:00.000Z',
			extensionVersion: '0.0.1',
			data: {
				profile: {
					version: 1,
					characterClass: 'Ninja',
					level: 5,
					xp: 10,
					totalXp: 100,
					streak: 1,
					longestStreak: 1,
					lastActiveDate: '2026-01-01'
					// achievements and cardName intentionally absent, as a real v1 export would be
				},
				sessionHistory: {
					version: 1,
					sessions: [],
					historicalAggregate: {
						totalSessions: 2,
						totalDurationMinutes: 20,
						totalFilesTouched: 4,
						totalBuildAttempts: 2,
						totalSuccessfulBuilds: 2,
						totalFailedBuilds: 0,
						totalTestRuns: 0,
						totalSuccessfulTests: 0,
						totalFailedTests: 0,
						totalCommits: 0,
						totalXpEarned: 10
						// totalRecoveries intentionally absent, as a real v1 aggregate would be
					}
				},
				companionState: { version: 1, selectedCompanionId: 'cyber-fox', unlockedCompanionIds: ['cyber-fox'] },
				themeSelection: { version: 1, selectedThemeId: 'default-cyber' },
				focusState: { version: 1 },
				questState: { version: 1, date: '', questIds: [], completedQuestIds: [] }
			}
		};

		await destination.importAll(oldEnvelope as unknown as Parameters<StorageService['importAll']>[0]);

		const profile = destination.getProfile();
		assert.equal(profile.level, 5, 'existing data survives the migration');
		assert.deepEqual(profile.achievements, [], 'missing v1 field was backfilled by the normal migrate() chain');
		assert.equal(destination.getFocusState().totalCompletedSessions, 0, 'missing focus fields backfilled to defaults');

		const history = destination.getSessionHistory();
		assert.equal(history.historicalAggregate.totalSessions, 2, 'existing aggregate data survives the migration');
		assert.equal(history.historicalAggregate.totalRecoveries, 0, 'missing v1 field was backfilled');
	});
});
