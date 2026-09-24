import { COMPANION_TYPES, CompanionType, isCompanionUnlocked } from '../companion/companions';
import type { CompanionStateStorage } from './companionTypes';

export interface SyncCompanionUnlocksResult {
	state: CompanionStateStorage;
	newlyUnlocked: CompanionType[];
}

/**
 * Compares the current level against each companion's unlock level and adds
 * any newly-qualifying companions to `unlockedCompanionIds`, mirroring how
 * `evaluateAchievements` reports which achievements just unlocked. Idempotent —
 * calling it repeatedly at the same level returns `newlyUnlocked: []` and the
 * same state.
 */
export function syncCompanionUnlocks(state: CompanionStateStorage, level: number): SyncCompanionUnlocksResult {
	const alreadyUnlocked = new Set(state.unlockedCompanionIds);
	const newlyUnlocked: CompanionType[] = [];

	for (const companion of COMPANION_TYPES) {
		if (isCompanionUnlocked(companion, level) && !alreadyUnlocked.has(companion.id)) {
			alreadyUnlocked.add(companion.id);
			newlyUnlocked.push(companion);
		}
	}

	if (newlyUnlocked.length === 0) {
		return { state, newlyUnlocked };
	}

	return {
		state: { ...state, unlockedCompanionIds: Array.from(alreadyUnlocked) },
		newlyUnlocked
	};
}
