import { CodingSession } from '../core/sessionTypes';
import { AchievementState } from '../core/types';
import { getLocalDateString } from '../core/streakSystem';
import { DailyActivity, PeriodStatistics } from './StatisticsTypes';

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfLocalDay(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function emptyPeriodStatistics(): PeriodStatistics {
	return {
		codingMinutes: 0,
		sessions: 0,
		buildAttempts: 0,
		successfulBuilds: 0,
		failedBuilds: 0,
		testRuns: 0,
		successfulTests: 0,
		failedTests: 0,
		commits: 0,
		xpEarned: 0,
		achievementsUnlocked: 0
	};
}

export function calculatePeriodStatistics(
	sessions: ReadonlyArray<CodingSession>,
	achievements: ReadonlyArray<AchievementState>,
	sinceMs: number,
	untilMs: number
): PeriodStatistics {
	const stats = emptyPeriodStatistics();

	for (const session of sessions) {
		if (session.endedAt < sinceMs || session.endedAt > untilMs) {
			continue;
		}
		stats.codingMinutes += session.durationMinutes;
		stats.sessions += 1;
		stats.buildAttempts += session.buildAttempts;
		stats.successfulBuilds += session.successfulBuilds;
		stats.failedBuilds += session.failedBuilds;
		stats.testRuns += session.testRuns;
		stats.successfulTests += session.successfulTests;
		stats.failedTests += session.failedTests;
		stats.commits += session.commits;
		stats.xpEarned += session.xpEarned;
	}

	for (const achievement of achievements) {
		const unlockedAtMs = Date.parse(achievement.unlockedAt);
		if (!Number.isNaN(unlockedAtMs) && unlockedAtMs >= sinceMs && unlockedAtMs <= untilMs) {
			stats.achievementsUnlocked += 1;
		}
	}

	return stats;
}

export function calculateDailyActivity(
	sessions: ReadonlyArray<CodingSession>,
	days: number,
	nowMs: number
): DailyActivity[] {
	const buckets = new Map<string, DailyActivity>();

	for (let i = days - 1; i >= 0; i--) {
		const date = getLocalDateString(new Date(nowMs - i * DAY_MS));
		buckets.set(date, { date, codingMinutes: 0, xpEarned: 0 });
	}

	for (const session of sessions) {
		const date = getLocalDateString(new Date(session.endedAt));
		const bucket = buckets.get(date);
		if (bucket) {
			bucket.codingMinutes += session.durationMinutes;
			bucket.xpEarned += session.xpEarned;
		}
	}

	return Array.from(buckets.values());
}
