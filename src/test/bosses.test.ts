import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BOSSES, findBoss } from '../core/bosses';

describe('findBoss', () => {
	test('finds a known boss by id', () => {
		const boss = findBoss('bug-hydra');
		assert.ok(boss);
		assert.equal(boss.name, 'Bug Hydra');
	});

	test('returns undefined for an unknown id', () => {
		assert.equal(findBoss('does-not-exist'), undefined);
	});

	test('every boss has a unique id, a non-empty emoji, and flavor text', () => {
		const ids = BOSSES.map((boss) => boss.id);
		assert.equal(new Set(ids).size, ids.length);
		for (const boss of BOSSES) {
			assert.ok(boss.emoji.length > 0);
			assert.ok(boss.flavorText.length > 0);
		}
	});
});
