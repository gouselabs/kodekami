import type { StorageService } from '../storage/storageService';
import { grantXp, GrantXpResult } from '../core/xpSystem';
import type { AchievementContext } from '../core/achievementSystem';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';

export async function startSession(
	storage: StorageService,
	onXpGranted: (result: GrantXpResult, context: AchievementContext) => void
): Promise<void> {
	const result = await grantXp(storage, getSettings().sessionStartXp);
	log(`Session started: +${getSettings().sessionStartXp} XP`);
	onXpGranted(result, {});
}
