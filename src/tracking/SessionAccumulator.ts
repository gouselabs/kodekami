import { CodingSession } from '../core/sessionTypes';

let nextSessionSeq = 0;

function createSessionId(startedAt: number): string {
	nextSessionSeq += 1;
	return `session-${startedAt}-${nextSessionSeq}`;
}

export class SessionAccumulator {
	readonly startedAt: number;
	private readonly touchedFiles = new Set<string>();
	private buildAttempts = 0;
	private successfulBuilds = 0;
	private failedBuilds = 0;
	private testRuns = 0;
	private successfulTests = 0;
	private failedTests = 0;
	private commits = 0;
	private recoveries = 0;
	private lastBuildWasFailure = false;
	private lastTestWasFailure = false;
	private xpEarned = 0;

	constructor(startedAt: number) {
		this.startedAt = startedAt;
	}

	recordFileTouched(fileKey: string): void {
		this.touchedFiles.add(fileKey);
	}

	recordBuild(success: boolean): void {
		this.buildAttempts += 1;
		if (success) {
			this.successfulBuilds += 1;
			if (this.lastBuildWasFailure) {
				this.recoveries += 1;
			}
			this.lastBuildWasFailure = false;
		} else {
			this.failedBuilds += 1;
			this.lastBuildWasFailure = true;
		}
	}

	recordTest(success: boolean): void {
		this.testRuns += 1;
		if (success) {
			this.successfulTests += 1;
			if (this.lastTestWasFailure) {
				this.recoveries += 1;
			}
			this.lastTestWasFailure = false;
		} else {
			this.failedTests += 1;
			this.lastTestWasFailure = true;
		}
	}

	recordCommit(): void {
		this.commits += 1;
	}

	addXp(amount: number): void {
		this.xpEarned += amount;
	}

	getInProgressCounts(): { successfulBuilds: number; successfulTests: number; commits: number; recoveries: number } {
		return {
			successfulBuilds: this.successfulBuilds,
			successfulTests: this.successfulTests,
			commits: this.commits,
			recoveries: this.recoveries
		};
	}

	finalize(endedAt: number): CodingSession {
		return {
			id: createSessionId(this.startedAt),
			startedAt: this.startedAt,
			endedAt,
			durationMinutes: Math.max(0, Math.round((endedAt - this.startedAt) / 60_000)),
			filesTouched: this.touchedFiles.size,
			buildAttempts: this.buildAttempts,
			successfulBuilds: this.successfulBuilds,
			failedBuilds: this.failedBuilds,
			testRuns: this.testRuns,
			successfulTests: this.successfulTests,
			failedTests: this.failedTests,
			commits: this.commits,
			recoveries: this.recoveries,
			xpEarned: this.xpEarned,
			completed: true
		};
	}
}
