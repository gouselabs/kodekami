import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pickReaction } from '../reactions/ReactionEngine';
import { REACTIONS, ReactionEventType } from '../reactions/reactions';

describe('pickReaction', () => {
	test('returns a reaction matching the requested event type', () => {
		const reaction = pickReaction('levelUp', () => 0);
		assert.ok(reaction);
		assert.equal(reaction.event, 'levelUp');
	});

	test('returns the first candidate when random() returns 0', () => {
		const levelUpReactions = REACTIONS.filter((r) => r.event === 'levelUp');
		const reaction = pickReaction('levelUp', () => 0);
		assert.equal(reaction, levelUpReactions[0]);
	});

	test('returns the last candidate when random() returns just under 1', () => {
		const achievementReactions = REACTIONS.filter((r) => r.event === 'achievementUnlocked');
		const reaction = pickReaction('achievementUnlocked', () => 0.999999);
		assert.equal(reaction, achievementReactions[achievementReactions.length - 1]);
	});

	test('never returns a reaction from a different event type', () => {
		for (let i = 0; i < 20; i++) {
			const reaction = pickReaction('achievementUnlocked', () => i / 20);
			assert.equal(reaction?.event, 'achievementUnlocked');
		}
	});

	test('every event type has at least one reaction defined', () => {
		const eventTypes: ReactionEventType[] = [
			'levelUp',
			'achievementUnlocked',
			'buildSuccess',
			'buildFailure',
			'testSuccess',
			'testFailure',
			'commit',
			'longSession',
			'returnAfterInactivity'
		];
		for (const eventType of eventTypes) {
			const reaction = pickReaction(eventType, () => 0);
			assert.ok(reaction, `expected at least one reaction for ${eventType}`);
		}
	});
});
