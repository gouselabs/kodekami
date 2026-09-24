import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { grantXp, GrantXpResult } from '../core/xpSystem';
import type { AchievementContext } from '../core/achievementSystem';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';
import { FocusTimer, FocusOutcome, FocusSession } from './FocusTimer';
import { codeKamiEvents } from '../events/codeKamiEvents';
import type { FocusPanelProvider } from '../webview/focusProvider';

const TICK_MS = 1000;

export class FocusService implements vscode.Disposable {
	private timer: FocusTimer | undefined;
	private tickInterval: ReturnType<typeof setInterval> | undefined;
	private completionTimeout: ReturnType<typeof setTimeout> | undefined;
	private readonly statusBarItem: vscode.StatusBarItem;

	constructor(
		private readonly storage: StorageService,
		private readonly panelProvider: FocusPanelProvider,
		private readonly onXpGranted: (result: GrantXpResult, context: AchievementContext) => void
	) {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
		this.statusBarItem.command = 'codekami.showFocusPanel';
	}

	isActive(): boolean {
		return this.timer !== undefined;
	}

	showPanel(): void {
		if (this.timer) {
			this.panelProvider.showLive(this.timer, Date.now(), { reveal: true });
		}
	}

	start(targetDurationMinutes: number, bossId?: string): void {
		if (this.timer) {
			return;
		}
		const startedAt = Date.now();
		this.timer = new FocusTimer(startedAt, targetDurationMinutes, bossId);
		log(`Focus session started: ${targetDurationMinutes}m${bossId ? ` vs ${bossId}` : ''}`);
		codeKamiEvents.emit({ type: 'focusStarted', targetDurationMinutes, bossId });

		this.panelProvider.showLive(this.timer, startedAt, { reveal: true });
		this.tick();
		this.tickInterval = setInterval(() => this.tick(), TICK_MS);
		this.completionTimeout = setTimeout(() => void this.finalize('completed'), targetDurationMinutes * 60_000);
	}

	async cancel(): Promise<void> {
		await this.finalize('cancelled');
	}

	async declareVictory(): Promise<void> {
		await this.finalize('manualWin');
	}

	private tick(): void {
		if (!this.timer) {
			return;
		}
		const now = Date.now();
		this.statusBarItem.text = this.formatStatusBar(now);
		this.statusBarItem.show();
		this.panelProvider.showLive(this.timer, now);
	}

	private formatStatusBar(nowMs: number): string {
		if (!this.timer) {
			return '';
		}
		const remainingMs = this.timer.getRemainingMs(nowMs);
		const totalSeconds = Math.max(0, Math.round(remainingMs / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const icon = this.timer.bossId ? '⚔️' : '🎯';
		return `${icon} ${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	private async finalize(outcome: FocusOutcome): Promise<void> {
		const timer = this.timer;
		if (!timer) {
			return;
		}
		this.timer = undefined;
		this.clearTimers();
		this.statusBarItem.hide();

		const session = timer.finalize(Date.now(), outcome, getSettings().focusXpPerMinute);
		await this.persistOutcome(session);

		log(`Focus session ${outcome}: ${session.elapsedMinutes}m${session.xpEarned ? `, +${session.xpEarned} XP` : ''}`);
		codeKamiEvents.emit(
			outcome === 'cancelled' ? { type: 'focusCancelled', session } : { type: 'focusCompleted', session }
		);

		if (session.xpEarned > 0) {
			const result = await grantXp(this.storage, session.xpEarned);
			this.onXpGranted(result, {});
		}

		this.panelProvider.showResult(session);
	}

	private async persistOutcome(session: FocusSession): Promise<void> {
		const state = this.storage.getFocusState();
		if (session.outcome === 'cancelled') {
			await this.storage.saveFocusState({ ...state, totalCancelledSessions: state.totalCancelledSessions + 1 });
			return;
		}
		await this.storage.saveFocusState({
			...state,
			totalCompletedSessions: state.totalCompletedSessions + 1,
			totalFocusMinutes: state.totalFocusMinutes + session.elapsedMinutes,
			totalManualWins: state.totalManualWins + (session.outcome === 'manualWin' ? 1 : 0),
			totalBossesDefeated: state.totalBossesDefeated + (session.bossId ? 1 : 0)
		});
	}

	private clearTimers(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = undefined;
		}
		if (this.completionTimeout) {
			clearTimeout(this.completionTimeout);
			this.completionTimeout = undefined;
		}
	}

	dispose(): void {
		this.clearTimers();
		this.statusBarItem.dispose();
	}
}
