import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_TYPES, DEFAULT_COMPANION_ID, findCompanionType } from '../companion/companions';

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
});
