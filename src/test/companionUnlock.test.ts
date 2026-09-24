import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { syncCompanionUnlocks } from '../core/companionUnlock';
import { createDefaultCompanionState } from '../core/companionTypes';

describe('syncCompanionUnlocks', () => {
	test('unlocks nothing new when the level only qualifies for already-unlocked companions', () => {
		const state = createDefaultCompanionState();
		const result = syncCompanionUnlocks(state, 1);

		assert.deepEqual(result.newlyUnlocked, []);
		assert.deepEqual(result.state.unlockedCompanionIds, ['cyber-fox']);
	});

	test('unlocks a companion once the level crosses its threshold', () => {
		const state = createDefaultCompanionState();
		const result = syncCompanionUnlocks(state, 5);

		assert.ok(result.newlyUnlocked.some((c) => c.id === 'shadow-cat'));
		assert.ok(result.state.unlockedCompanionIds.includes('shadow-cat'));
	});

	test('unlocks every companion up to and including the current level in one pass', () => {
		const state = createDefaultCompanionState();
		const result = syncCompanionUnlocks(state, 25);

		const unlockedIds = result.newlyUnlocked.map((c) => c.id).sort();
		assert.deepEqual(unlockedIds, ['cyber-slime', 'shadow-cat', 'spirit-dragon'].sort());
	});

	test('is idempotent — calling again at the same level unlocks nothing further', () => {
		const state = createDefaultCompanionState();
		const first = syncCompanionUnlocks(state, 10);
		const second = syncCompanionUnlocks(first.state, 10);

		assert.deepEqual(second.newlyUnlocked, []);
		assert.deepEqual(second.state, first.state);
	});

	test('returns the same state reference when nothing unlocks, avoiding an unnecessary write', () => {
		const state = createDefaultCompanionState();
		const result = syncCompanionUnlocks(state, 1);

		assert.equal(result.state, state);
	});

	test('never re-locks a companion already unlocked, even if called with a lower level', () => {
		const state = createDefaultCompanionState();
		const leveled = syncCompanionUnlocks(state, 50).state;
		const result = syncCompanionUnlocks(leveled, 1);

		assert.deepEqual(result.newlyUnlocked, []);
		assert.ok(result.state.unlockedCompanionIds.includes('zen-panda'));
	});
});
