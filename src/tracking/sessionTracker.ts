import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { grantXp, GrantXpResult } from '../core/xpSystem';
import type { AchievementContext } from '../core/achievementSystem';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';
import { SessionAccumulator } from './SessionAccumulator';
import { codeKamiEvents } from '../events/codeKamiEvents';
import type { TaskKind } from './taskClassifier';

export async function startSession(
	storage: StorageService,
	onXpGranted: (result: GrantXpResult, context: AchievementContext) => void
): Promise<void> {
	const result = await grantXp(storage, getSettings().sessionStartXp);
	log(`Session started: +${getSettings().sessionStartXp} XP`);
	onXpGranted(result, {});
}

export class SessionTrackerService implements vscode.Disposable {
	private accumulator: SessionAccumulator | undefined;
	private inactivityTimer: ReturnType<typeof setTimeout> | undefined;
	private xpBaselineTotalXp = 0;
	private hadPriorSession = false;
	private readonly saveListener: vscode.Disposable;

	constructor(private readonly storage: StorageService) {
		this.saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
			this.touchActivity();
			this.accumulator?.recordFileTouched(document.uri.toString());
		});
	}

	recordBuildOrTest(kind: TaskKind, success: boolean): void {
		if (kind === 'unknown') {
			return;
		}
		this.touchActivity();
		if (kind === 'build') {
			this.accumulator?.recordBuild(success);
		} else {
			this.accumulator?.recordTest(success);
		}
	}

	recordCommit(): void {
		this.touchActivity();
		this.accumulator?.recordCommit();
	}

	/**
	 * Counts from the currently in-progress session (not yet persisted — that
	 * only happens when the session ends). Used so build/test/commit-based
	 * achievements can unlock immediately rather than waiting for the session
	 * to end.
	 */
	getInProgressCounts(): { successfulBuilds: number; successfulTests: number; commits: number; recoveries: number } {
		return this.accumulator?.getInProgressCounts() ?? { successfulBuilds: 0, successfulTests: 0, commits: 0, recoveries: 0 };
	}

	private touchActivity(): void {
		const now = Date.now();
		if (!this.accumulator) {
			this.accumulator = new SessionAccumulator(now);
			this.xpBaselineTotalXp = this.storage.getProfile().totalXp;
			log('Coding session started');
			codeKamiEvents.emit({ type: 'sessionStarted', isReturn: this.hadPriorSession });
		}
		this.rescheduleInactivityTimer();
	}

	private rescheduleInactivityTimer(): void {
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
		}
		const { sessionInactivityMs } = getSettings();
		this.inactivityTimer = setTimeout(() => {
			void this.endSession();
		}, sessionInactivityMs);
	}

	private async endSession(): Promise<void> {
		const accumulator = this.accumulator;
		if (!accumulator) {
			return;
		}
		this.accumulator = undefined;
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
			this.inactivityTimer = undefined;
		}

		const currentTotalXp = this.storage.getProfile().totalXp;
		accumulator.addXp(Math.max(0, currentTotalXp - this.xpBaselineTotalXp));

		const session = accumulator.finalize(Date.now());
		await this.storage.appendSession(session);
		log(`Coding session ended: ${session.durationMinutes}m, +${session.xpEarned} XP`);
		this.hadPriorSession = true;
		codeKamiEvents.emit({ type: 'sessionEnded', session });
	}

	async finalize(): Promise<void> {
		await this.endSession();
	}

	dispose(): void {
		this.saveListener.dispose();
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
		}
	}
}
