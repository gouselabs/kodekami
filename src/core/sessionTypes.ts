export interface CodingSession {
	id: string;
	startedAt: number;
	endedAt: number;
	durationMinutes: number;
	filesTouched: number;
	buildAttempts: number;
	successfulBuilds: number;
	failedBuilds: number;
	testRuns: number;
	successfulTests: number;
	failedTests: number;
	commits: number;
	/** A failed build or test immediately followed by a successful one of the same kind. */
	recoveries: number;
	xpEarned: number;
	completed: boolean;
}

export interface HistoricalAggregate {
	totalSessions: number;
	totalDurationMinutes: number;
	totalFilesTouched: number;
	totalBuildAttempts: number;
	totalSuccessfulBuilds: number;
	totalFailedBuilds: number;
	totalTestRuns: number;
	totalSuccessfulTests: number;
	totalFailedTests: number;
	totalCommits: number;
	totalRecoveries: number;
	totalXpEarned: number;
}

export interface SessionHistoryStorage {
	version: number;
	sessions: CodingSession[];
	historicalAggregate: HistoricalAggregate;
}

export const SESSION_HISTORY_VERSION = 2;
export const MAX_STORED_SESSIONS = 500;

export function createEmptyAggregate(): HistoricalAggregate {
	return {
		totalSessions: 0,
		totalDurationMinutes: 0,
		totalFilesTouched: 0,
		totalBuildAttempts: 0,
		totalSuccessfulBuilds: 0,
		totalFailedBuilds: 0,
		totalTestRuns: 0,
		totalSuccessfulTests: 0,
		totalFailedTests: 0,
		totalCommits: 0,
		totalRecoveries: 0,
		totalXpEarned: 0
	};
}

export function createDefaultSessionHistory(): SessionHistoryStorage {
	return {
		version: SESSION_HISTORY_VERSION,
		sessions: [],
		historicalAggregate: createEmptyAggregate()
	};
}
