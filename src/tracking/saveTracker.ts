import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { grantXp, GrantXpResult } from '../core/xpSystem';
import type { AchievementContext } from '../core/achievementSystem';
import { isWithinCooldown } from '../core/cooldown';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';

export function registerSaveTracker(
	storage: StorageService,
	onXpGranted: (result: GrantXpResult, context: AchievementContext) => void
): vscode.Disposable {
	const lastRewardedAt = new Map<string, number>();

	return vscode.workspace.onDidSaveTextDocument(async (document) => {
		const settings = getSettings();
		const key = document.uri.toString();
		const now = Date.now();
		const last = lastRewardedAt.get(key) ?? 0;

		if (isWithinCooldown(last, now, settings.fileSaveCooldownMs)) {
			return;
		}

		lastRewardedAt.set(key, now);
		const result = await grantXp(storage, settings.fileSaveXp);
		log(`File saved: +${settings.fileSaveXp} XP`);
		onXpGranted(result, { hour: new Date().getHours() });
	});
}
