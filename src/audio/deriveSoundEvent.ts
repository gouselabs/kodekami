import type { CodeKamiEvent } from '../events/codeKamiEvents';
import { LONG_SESSION_MINUTES } from '../core/config';
import { SoundEvent } from './AudioRegistry';

export function deriveSoundEvent(event: CodeKamiEvent): SoundEvent | undefined {
	switch (event.type) {
		case 'levelUp':
			return 'levelUp';
		case 'achievementUnlocked':
			return 'achievementUnlocked';
		case 'streakMilestone':
			return 'streakMilestone';
		case 'commit':
			return 'commit';
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
			return event.isReturn ? 'returnAfterInactivity' : undefined;
		default:
			return undefined;
	}
}

/** Level-up and achievement sounds are always significant enough to bypass the cooldown. */
export function bypassesSoundCooldown(soundEvent: SoundEvent): boolean {
	return soundEvent === 'levelUp' || soundEvent === 'achievementUnlocked';
}
