import { DAILY_MESSAGES, DailyMessage } from './dailyMotivation';
import { getLocalDateString } from '../core/streakSystem';

function hashString(value: string): number {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
	}
	return hash;
}

/**
 * Deterministically picks the same message for the whole local day,
 * derived from the date string alone — no randomness, no server.
 */
export function getDailyMessage(date: Date = new Date()): DailyMessage {
	const dateString = getLocalDateString(date);
	const index = hashString(dateString) % DAILY_MESSAGES.length;
	return DAILY_MESSAGES[index];
}
