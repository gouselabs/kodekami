import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_FILES, SoundEvent } from '../audio/AudioRegistry';

describe('SOUND_FILES', () => {
	test('every sound event has a non-empty filename', () => {
		const events: SoundEvent[] = [
			'levelUp',
			'achievementUnlocked',
			'buildSuccess',
			'buildFailure',
			'testSuccess',
			'testFailure',
			'commit',
			'longSession',
			'returnAfterInactivity',
			'streakMilestone'
		];
		for (const event of events) {
			assert.ok(SOUND_FILES[event]?.length > 0, `expected a filename for ${event}`);
		}
	});

	test('every filename ends in a recognized audio extension', () => {
		for (const fileName of Object.values(SOUND_FILES)) {
			assert.match(fileName, /\.(wav|mp3|ogg)$/i);
		}
	});
});
