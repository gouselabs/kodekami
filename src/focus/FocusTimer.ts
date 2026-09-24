export type FocusOutcome = 'completed' | 'cancelled' | 'manualWin';

export interface FocusSession {
	startedAt: number;
	endedAt: number;
	targetDurationMinutes: number;
	elapsedMinutes: number;
	bossId?: string;
	outcome: FocusOutcome;
	xpEarned: number;
}

export const FOCUS_DURATION_OPTIONS_MINUTES: ReadonlyArray<number> = [15, 25, 45, 60];

export class FocusTimer {
	readonly startedAt: number;
	readonly targetDurationMinutes: number;
	readonly bossId?: string;

	constructor(startedAt: number, targetDurationMinutes: number, bossId?: string) {
		this.startedAt = startedAt;
		this.targetDurationMinutes = targetDurationMinutes;
		this.bossId = bossId;
	}

	private getTargetMs(): number {
		return this.targetDurationMinutes * 60_000;
	}

	getElapsedMs(nowMs: number): number {
		return Math.max(0, nowMs - this.startedAt);
	}

	getElapsedMinutes(nowMs: number): number {
		return this.getElapsedMs(nowMs) / 60_000;
	}

	getRemainingMs(nowMs: number): number {
		return Math.max(0, this.getTargetMs() - this.getElapsedMs(nowMs));
	}

	isDue(nowMs: number): boolean {
		return this.getRemainingMs(nowMs) <= 0;
	}

	/** Percentage of time remaining, used to drive the boss's HP bar (100 at start, 0 once due). */
	getBossHpPercent(nowMs: number): number {
		return Math.max(0, Math.min(100, Math.round((this.getRemainingMs(nowMs) / this.getTargetMs()) * 100)));
	}

	finalize(nowMs: number, outcome: FocusOutcome, xpPerMinute: number): FocusSession {
		const elapsedMinutes = Math.round(this.getElapsedMinutes(nowMs) * 10) / 10;
		const xpEarned = outcome === 'cancelled' ? 0 : Math.max(0, Math.round(elapsedMinutes * xpPerMinute));
		return {
			startedAt: this.startedAt,
			endedAt: nowMs,
			targetDurationMinutes: this.targetDurationMinutes,
			elapsedMinutes,
			bossId: this.bossId,
			outcome,
			xpEarned
		};
	}
}
