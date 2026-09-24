import type { CodeKamiEvent } from '../events/codeKamiEvents';
import { LONG_SESSION_MINUTES } from '../core/config';

export type CompanionMood =
	| 'idle'
	| 'coding'
	| 'buildSuccess'
	| 'buildFailure'
	| 'testSuccess'
	| 'testFailure'
	| 'levelUp'
	| 'achievement'
	| 'longSession'
	| 'inactive'
	| 'focusMode'
	| 'comeback';

const MOOD_EMOJI: Record<CompanionMood, string> = {
	idle: '😐',
	coding: '👀',
	buildSuccess: '🔥',
	buildFailure: '💀',
	testSuccess: '✨',
	testFailure: '😵',
	levelUp: '⚡',
	achievement: '👑',
	longSession: '😴',
	inactive: '💤',
	focusMode: '🎯',
	comeback: '⚔️'
};

export function getMoodEmoji(mood: CompanionMood): string {
	return MOOD_EMOJI[mood];
}

/**
 * Maps a CodeKami event to the companion mood it should react with, if any.
 * Returns undefined for events the companion doesn't react to.
 */
export function deriveMoodFromEvent(event: CodeKamiEvent): CompanionMood | undefined {
	switch (event.type) {
		case 'levelUp':
			return 'levelUp';
		case 'achievementUnlocked':
			return 'achievement';
		case 'streakMilestone':
			return 'achievement';
		case 'commit':
			return 'coding';
		case 'taskCompleted':
			if (event.kind === 'build') {
				return event.success ? 'buildSuccess' : 'buildFailure';
			}
			if (event.kind === 'test') {
				return event.success ? 'testSuccess' : 'testFailure';
			}
			return undefined;
		case 'sessionEnded':
			return event.session.durationMinutes >= LONG_SESSION_MINUTES ? 'longSession' : undefined;
		case 'sessionStarted':
			return event.isReturn ? 'comeback' : undefined;
		case 'focusStarted':
			return 'focusMode';
		case 'focusCompleted':
			return 'achievement';
		default:
			return undefined;
	}
}
