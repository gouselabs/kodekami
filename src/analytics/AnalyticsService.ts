import type { StorageService } from '../storage/storageService';
import { calculateDailyActivity, calculatePeriodStatistics, startOfLocalDay } from './StatisticsCalculator';
import { AnalyticsSnapshot } from './StatisticsTypes';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_ACTIVITY_DAYS = 14;

export function buildAnalyticsSnapshot(storage: StorageService, now: number = Date.now()): AnalyticsSnapshot {
	const sessions = storage.getSessionHistory().sessions;
	const achievements = storage.getProfile().achievements;

	return {
		today: calculatePeriodStatistics(sessions, achievements, startOfLocalDay(new Date(now)), now),
		weekly: calculatePeriodStatistics(sessions, achievements, now - 7 * DAY_MS, now),
		monthly: calculatePeriodStatistics(sessions, achievements, now - 30 * DAY_MS, now),
		dailyActivity: calculateDailyActivity(sessions, DAILY_ACTIVITY_DAYS, now)
	};
}
