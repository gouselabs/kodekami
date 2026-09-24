import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { SessionTrackerService } from '../tracking/sessionTracker';
import { buildAchievementContext } from '../core/achievementContextBuilder';

function fakeSessionTracker(counts: {
	successfulBuilds: number;
	successfulTests: number;
	commits: number;
	recoveries: number;
}): SessionTrackerService {
	return {
		getInProgressCounts: () => counts
	} as unknown as SessionTrackerService;
}

describe('buildAchievementContext', () => {
	test('maps in-progress session counts onto the achievement context field names', () => {
		const tracker = fakeSessionTracker({ successfulBuilds: 3, successfulTests: 7, commits: 2, recoveries: 1 });
		const context = buildAchievementContext(tracker);

		assert.equal(context.totalSuccessfulBuilds, 3);
		assert.equal(context.totalSuccessfulTests, 7);
		assert.equal(context.totalCommits, 2);
		assert.equal(context.totalRecoveries, 1);
	});

	test('extra fields override the computed ones when both are provided', () => {
		const tracker = fakeSessionTracker({ successfulBuilds: 3, successfulTests: 7, commits: 2, recoveries: 1 });
		const context = buildAchievementContext(tracker, { totalCommits: 99, hour: 3 });

		assert.equal(context.totalCommits, 99, 'explicit extra should win over the computed value');
		assert.equal(context.totalSuccessfulBuilds, 3, 'fields not present in extra keep their computed value');
		assert.equal(context.hour, 3);
	});

	test('works with all-zero counts', () => {
		const tracker = fakeSessionTracker({ successfulBuilds: 0, successfulTests: 0, commits: 0, recoveries: 0 });
		const context = buildAchievementContext(tracker);

		assert.equal(context.totalSuccessfulBuilds, 0);
		assert.equal(context.totalSuccessfulTests, 0);
		assert.equal(context.totalCommits, 0);
		assert.equal(context.totalRecoveries, 0);
	});
});
