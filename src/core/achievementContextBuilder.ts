import type { SessionTrackerService } from '../tracking/sessionTracker';
import { AchievementContext } from './achievementSystem';

/**
 * Single place that assembles an AchievementContext from the current
 * in-progress session's live counts, so callers reacting to build/test/commit
 * events don't each hand-wire the same object literal. `checkAchievements`
 * adds these totals on top of already-persisted history — see its docstring.
 */
export function buildAchievementContext(
	sessionTracker: SessionTrackerService,
	extra: Partial<AchievementContext> = {}
): AchievementContext {
	const counts = sessionTracker.getInProgressCounts();
	return {
		totalCommits: counts.commits,
		totalSuccessfulBuilds: counts.successfulBuilds,
		totalSuccessfulTests: counts.successfulTests,
		totalRecoveries: counts.recoveries,
		...extra
	};
}
