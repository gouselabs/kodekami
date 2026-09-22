import { DEFAULT_COMPANION_ID } from '../companion/companions';

export interface CompanionStateStorage {
	version: number;
	selectedCompanionId: string;
	unlockedCompanionIds: string[];
}

export const COMPANION_STATE_VERSION = 1;

export function createDefaultCompanionState(): CompanionStateStorage {
	return {
		version: COMPANION_STATE_VERSION,
		selectedCompanionId: DEFAULT_COMPANION_ID,
		unlockedCompanionIds: [DEFAULT_COMPANION_ID]
	};
}
