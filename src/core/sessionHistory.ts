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
