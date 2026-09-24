import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { selectDailyQuests, DAILY_QUEST_COUNT } from '../core/questSelection';
import { QUEST_DEFINITIONS } from '../core/quests';

describe('selectDailyQuests', () => {
	test('picks the default number of quests', () => {
		const picked = selectDailyQuests('2026-01-01');
		assert.equal(picked.length, DAILY_QUEST_COUNT);
	});

	test('picks distinct quests, no duplicates', () => {
		const picked = selectDailyQuests('2026-01-01');
		const ids = picked.map((q) => q.id);
		assert.equal(new Set(ids).size, ids.length);
	});

	test('is deterministic — the same date always picks the same quests', () => {
		const first = selectDailyQuests('2026-03-14').map((q) => q.id);
		const second = selectDailyQuests('2026-03-14').map((q) => q.id);
		assert.deepEqual(first, second);
	});

	test('different dates can pick different quests', () => {
		const days = Array.from({ length: 30 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`);
		const selections = days.map((day) => selectDailyQuests(day).map((q) => q.id).sort().join(','));
		assert.ok(new Set(selections).size > 1, 'expected at least some variation across 30 different days');
	});

	test('respects a custom count', () => {
		const picked = selectDailyQuests('2026-01-01', QUEST_DEFINITIONS.length);
		assert.equal(picked.length, QUEST_DEFINITIONS.length);
	});

	test('never picks more than the number of quest definitions that exist', () => {
		const picked = selectDailyQuests('2026-01-01', 100);
		assert.equal(picked.length, QUEST_DEFINITIONS.length);
	});
});
