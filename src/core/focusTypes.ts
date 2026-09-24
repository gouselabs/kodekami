export interface FocusStateStorage {
	version: number;
	totalCompletedSessions: number;
	totalCancelledSessions: number;
	totalManualWins: number;
	totalFocusMinutes: number;
	totalBossesDefeated: number;
}

export const FOCUS_STATE_VERSION = 1;

export function createDefaultFocusState(): FocusStateStorage {
	return {
		version: FOCUS_STATE_VERSION,
		totalCompletedSessions: 0,
		totalCancelledSessions: 0,
		totalManualWins: 0,
		totalFocusMinutes: 0,
		totalBossesDefeated: 0
	};
}
