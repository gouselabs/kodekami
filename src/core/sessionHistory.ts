import { CodingSession, HistoricalAggregate, MAX_STORED_SESSIONS, SessionHistoryStorage } from './sessionTypes';

export function foldIntoAggregate(aggregate: HistoricalAggregate, session: CodingSession): HistoricalAggregate {
	return {
		totalSessions: aggregate.totalSessions + 1,
		totalDurationMinutes: aggregate.totalDurationMinutes + session.durationMinutes,
		totalFilesTouched: aggregate.totalFilesTouched + session.filesTouched,
		totalBuildAttempts: aggregate.totalBuildAttempts + session.buildAttempts,
		totalSuccessfulBuilds: aggregate.totalSuccessfulBuilds + session.successfulBuilds,
		totalFailedBuilds: aggregate.totalFailedBuilds + session.failedBuilds,
		totalTestRuns: aggregate.totalTestRuns + session.testRuns,
		totalSuccessfulTests: aggregate.totalSuccessfulTests + session.successfulTests,
		totalFailedTests: aggregate.totalFailedTests + session.failedTests,
		totalCommits: aggregate.totalCommits + session.commits,
		totalRecoveries: aggregate.totalRecoveries + session.recoveries,
		totalXpEarned: aggregate.totalXpEarned + session.xpEarned
	};
}

export function appendSession(history: SessionHistoryStorage, session: CodingSession): SessionHistoryStorage {
	const sessions = [...history.sessions, session];
	let aggregate = history.historicalAggregate;

	while (sessions.length > MAX_STORED_SESSIONS) {
		const oldest = sessions.shift();
		if (oldest) {
			aggregate = foldIntoAggregate(aggregate, oldest);
		}
	}

	return { ...history, sessions, historicalAggregate: aggregate };
}

export interface AllTimeSessionTotals {
	totalCommits: number;
	totalSuccessfulBuilds: number;
	totalSuccessfulTests: number;
	totalRecoveries: number;
}

/**
 * All-time totals across every session ever recorded, including sessions
 * already folded into the historical aggregate (older than the 500-session
 * cap). Used for achievement conditions like "50 commits" that need to look
 * further back than the currently-stored session list.
 */
export function computeAllTimeSessionTotals(history: SessionHistoryStorage): AllTimeSessionTotals {
	let totalCommits = history.historicalAggregate.totalCommits;
	let totalSuccessfulBuilds = history.historicalAggregate.totalSuccessfulBuilds;
	let totalSuccessfulTests = history.historicalAggregate.totalSuccessfulTests;
	let totalRecoveries = history.historicalAggregate.totalRecoveries;

	for (const session of history.sessions) {
		totalCommits += session.commits;
		totalSuccessfulBuilds += session.successfulBuilds;
		totalSuccessfulTests += session.successfulTests;
		totalRecoveries += session.recoveries;
	}

	return { totalCommits, totalSuccessfulBuilds, totalSuccessfulTests, totalRecoveries };
}
