import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_TYPES, DEFAULT_COMPANION_ID, findCompanionType, isCompanionUnlocked } from '../companion/companions';

describe('findCompanionType', () => {
	test('finds a known companion by id', () => {
		const companion = findCompanionType('cyber-fox');
		assert.ok(companion);
		assert.equal(companion.name, 'Cyber Fox');
	});

	test('returns undefined for an unknown id', () => {
		assert.equal(findCompanionType('does-not-exist'), undefined);
	});

	test('the default companion id resolves to a real companion', () => {
		assert.ok(findCompanionType(DEFAULT_COMPANION_ID));
	});

	test('every companion has a non-empty emoji', () => {
		for (const companion of COMPANION_TYPES) {
			assert.ok(companion.emoji.length > 0);
		}
	});

	test('every companion has a unique id', () => {
		const ids = COMPANION_TYPES.map((c) => c.id);
		assert.equal(new Set(ids).size, ids.length);
	});

	test('the default companion is unlocked from level 1', () => {
		const defaultCompanion = findCompanionType(DEFAULT_COMPANION_ID);
		assert.ok(defaultCompanion);
		assert.equal(defaultCompanion.unlockLevel, 1);
	});
});

describe('isCompanionUnlocked', () => {
	test('unlocked once the level meets the unlock level', () => {
		const dragon = findCompanionType('spirit-dragon');
		assert.ok(dragon);
		assert.equal(isCompanionUnlocked(dragon, 25), true);
		assert.equal(isCompanionUnlocked(dragon, 30), true);
	});

	test('locked below the unlock level', () => {
		const dragon = findCompanionType('spirit-dragon');
		assert.ok(dragon);
		assert.equal(isCompanionUnlocked(dragon, 24), false);
	});
});
