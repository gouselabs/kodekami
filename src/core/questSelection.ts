import { QUEST_DEFINITIONS, QuestDefinition } from './quests';

function hashString(value: string): number {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export const DAILY_QUEST_COUNT = 3;

/**
 * Deterministically picks the same N quests for the whole local day, derived
 * from the date string alone — no randomness, no server. Mirrors
 * DailyContentService's date-hash pattern, extended to pick several distinct
 * items (by ranking each quest's own date+id hash) instead of just one.
 */
export function selectDailyQuests(dateString: string, count: number = DAILY_QUEST_COUNT): QuestDefinition[] {
	return [...QUEST_DEFINITIONS]
		.map((quest) => ({ quest, score: hashString(`${dateString}:${quest.id}`) }))
		.sort((a, b) => a.score - b.score)
		.slice(0, count)
		.map((entry) => entry.quest);
}
