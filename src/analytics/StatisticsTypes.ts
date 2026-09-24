export interface PeriodStatistics {
	codingMinutes: number;
	sessions: number;
	buildAttempts: number;
	successfulBuilds: number;
	failedBuilds: number;
	testRuns: number;
	successfulTests: number;
	failedTests: number;
	commits: number;
	xpEarned: number;
	achievementsUnlocked: number;
}

export interface DailyActivity {
	date: string;
	codingMinutes: number;
	xpEarned: number;
}

export interface AnalyticsSnapshot {
	today: PeriodStatistics;
	weekly: PeriodStatistics;
	monthly: PeriodStatistics;
	dailyActivity: DailyActivity[];
}
