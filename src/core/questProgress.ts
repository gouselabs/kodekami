import { QuestStateStorage, createDefaultQuestState } from './questTypes';
import { selectDailyQuests } from './questSelection';
import { findQuest, QuestDefinition } from './quests';

export interface SyncQuestsForTodayResult {
	state: QuestStateStorage;
}

/** Rolls today's quest selection forward if the stored state is from a previous day (or empty). */
export function syncQuestsForToday(state: QuestStateStorage, today: string): SyncQuestsForTodayResult {
	if (state.date === today && state.questIds.length > 0) {
		return { state };
	}
	const questIds = selectDailyQuests(today).map((quest) => quest.id);
	return { state: { ...createDefaultQuestState(), date: today, questIds } };
}

export function isQuestCompleted(state: QuestStateStorage, questId: string): boolean {
	return state.completedQuestIds.includes(questId);
}

export function completeQuest(state: QuestStateStorage, questId: string): QuestStateStorage {
	if (!state.questIds.includes(questId) || isQuestCompleted(state, questId)) {
		return state;
	}
	return { ...state, completedQuestIds: [...state.completedQuestIds, questId] };
}

export interface QuestView {
	quest: QuestDefinition;
	completed: boolean;
}

export function getTodaysQuestViews(state: QuestStateStorage): QuestView[] {
	return state.questIds
		.map((id) => findQuest(id))
		.filter((quest): quest is QuestDefinition => quest !== undefined)
		.map((quest) => ({ quest, completed: isQuestCompleted(state, quest.id) }));
}
