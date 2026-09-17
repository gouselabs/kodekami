import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isWithinCooldown } from '../core/cooldown';

describe('isWithinCooldown', () => {
	test('is true immediately after the last reward', () => {
		assert.equal(isWithinCooldown(1000, 1000, 60_000), true);
	});

	test('is true just before the cooldown expires', () => {
		assert.equal(isWithinCooldown(1000, 1000 + 59_999, 60_000), true);
	});

	test('is false once the cooldown has fully elapsed', () => {
		assert.equal(isWithinCooldown(1000, 1000 + 60_000, 60_000), false);
	});

	test('is false long after the cooldown', () => {
		assert.equal(isWithinCooldown(1000, 1_000_000, 60_000), false);
	});
});
