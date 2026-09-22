import { CodingSession } from '../core/sessionTypes';
import { formatDuration } from '../utils/format';

export function generateSessionSummaryText(session: CodingSession, streak: number): string {
	const lines = [
		'SESSION COMPLETE',
		'',
		`Duration        ${formatDuration(session.durationMinutes)}`,
		`Files touched   ${session.filesTouched}`,
		`Builds          ${session.successfulBuilds} / ${session.buildAttempts}`,
		`Tests           ${session.successfulTests} / ${session.testRuns}`,
		`Commits         ${session.commits}`,
		'',
		`XP Earned       +${session.xpEarned}`,
		`🔥 Streak        ${streak} days`,
		'',
		'CODEKAMI'
	];

	return lines.join('\n');
}
