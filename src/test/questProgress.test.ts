import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { syncQuestsForToday, isQuestCompleted, completeQuest, getTodaysQuestViews } from '../core/questProgress';
import { createDefaultQuestState } from '../core/questTypes';
import { DAILY_QUEST_COUNT } from '../core/questSelection';

describe('syncQuestsForToday', () => {
	test('picks a fresh selection when nothing is stored', () => {
		const result = syncQuestsForToday(createDefaultQuestState(), '2026-01-01');
		assert.equal(result.state.date, '2026-01-01');
		assert.equal(result.state.questIds.length, DAILY_QUEST_COUNT);
	});

	test('keeps the existing selection when the date has not changed', () => {
		const today = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const withProgress = completeQuest(today, today.questIds[0]);

		const result = syncQuestsForToday(withProgress, '2026-01-01');
		assert.deepEqual(result.state, withProgress);
	});

	test('rolls forward to a fresh selection and clears progress when the date changes', () => {
		const yesterday = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const withProgress = completeQuest(yesterday, yesterday.questIds[0]);

		const result = syncQuestsForToday(withProgress, '2026-01-02');
		assert.equal(result.state.date, '2026-01-02');
		assert.deepEqual(result.state.completedQuestIds, []);
	});
});

describe('completeQuest', () => {
	test('marks a quest in today\'s selection as completed', () => {
		const state = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const questId = state.questIds[0];

		const updated = completeQuest(state, questId);
		assert.equal(isQuestCompleted(updated, questId), true);
	});

	test('is a no-op for a quest not in today\'s selection', () => {
		const state = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const updated = completeQuest(state, 'not-a-real-quest-id');
		assert.deepEqual(updated, state);
	});

	test('completing an already-completed quest does not duplicate it', () => {
		const state = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const questId = state.questIds[0];

		const once = completeQuest(state, questId);
		const twice = completeQuest(once, questId);
		assert.equal(twice.completedQuestIds.filter((id) => id === questId).length, 1);
	});
});

describe('getTodaysQuestViews', () => {
	test('returns a view for each selected quest with its completion status', () => {
		const state = syncQuestsForToday(createDefaultQuestState(), '2026-01-01').state;
		const completedId = state.questIds[0];
		const withProgress = completeQuest(state, completedId);

		const views = getTodaysQuestViews(withProgress);
		assert.equal(views.length, DAILY_QUEST_COUNT);
		assert.equal(views.find((v) => v.quest.id === completedId)?.completed, true);
		assert.equal(views.filter((v) => v.completed).length, 1);
	});
});
