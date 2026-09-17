export interface AchievementState {
	id: string;
	unlockedAt: string;
}

export interface CodeKamiProfile {
	version: number;
	characterClass: string | null;
	cardName: string | null;
	level: number;
	xp: number;
	totalXp: number;
	streak: number;
	longestStreak: number;
	lastActiveDate: string | null;
	achievements: AchievementState[];
}

export const PROFILE_VERSION = 3;

export function createDefaultProfile(): CodeKamiProfile {
	return {
		version: PROFILE_VERSION,
		characterClass: null,
		cardName: null,
		level: 1,
		xp: 0,
		totalXp: 0,
		streak: 0,
		longestStreak: 0,
		lastActiveDate: null,
		achievements: []
	};
}
