import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ReactionCooldown } from '../reactions/ReactionCooldown';

describe('ReactionCooldown', () => {
	test('allows showing immediately when nothing has been shown yet', () => {
		const cooldown = new ReactionCooldown();
		assert.equal(cooldown.canShow(1000, 45_000), true);
	});

	test('blocks showing again within the cooldown window', () => {
		const cooldown = new ReactionCooldown();
		cooldown.markShown(1000);
		assert.equal(cooldown.canShow(1000 + 10_000, 45_000), false);
	});

	test('allows showing again once the cooldown has elapsed', () => {
		const cooldown = new ReactionCooldown();
		cooldown.markShown(1000);
		assert.equal(cooldown.canShow(1000 + 45_000, 45_000), true);
	});

	test('each markShown resets the window', () => {
		const cooldown = new ReactionCooldown();
		cooldown.markShown(1000);
		cooldown.markShown(2000);
		assert.equal(cooldown.canShow(2000 + 10_000, 45_000), false);
		assert.equal(cooldown.canShow(2000 + 45_000, 45_000), true);
	});
});
