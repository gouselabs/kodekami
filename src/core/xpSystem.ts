import type { StorageService } from '../storage/storageService';
import { applyXp } from './levelSystem';

export interface GrantXpResult {
	leveledUpTo: number[];
}

export async function grantXp(storage: StorageService, amount: number): Promise<GrantXpResult> {
	const profile = storage.getProfile();
	const { profile: updated, leveledUpTo } = applyXp(profile, amount);
	await storage.saveProfile(updated);
	return { leveledUpTo };
}
