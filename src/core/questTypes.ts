export interface QuestStateStorage {
	version: number;
	/** The local date (YYYY-MM-DD) this selection was picked for. */
	date: string;
	/** Today's selected quest ids, in a stable order. */
	questIds: string[];
	completedQuestIds: string[];
}

export const QUEST_STATE_VERSION = 1;

export function createDefaultQuestState(): QuestStateStorage {
	return {
		version: QUEST_STATE_VERSION,
		date: '',
		questIds: [],
		completedQuestIds: []
	};
}
