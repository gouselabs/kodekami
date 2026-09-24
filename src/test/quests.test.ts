import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { QUEST_DEFINITIONS, findQuest } from '../core/quests';

describe('findQuest', () => {
	test('finds a known quest by id', () => {
		const quest = findQuest('commit-once');
		assert.ok(quest);
		assert.equal(quest.name, 'Commit Something');
	});

	test('returns undefined for an unknown id', () => {
		assert.equal(findQuest('does-not-exist'), undefined);
	});

	test('every quest has a unique id', () => {
		const ids = QUEST_DEFINITIONS.map((q) => q.id);
		assert.equal(new Set(ids).size, ids.length);
	});

	test('has exactly 5 auto quests and 2 manual quests', () => {
		const auto = QUEST_DEFINITIONS.filter((q) => q.kind === 'auto');
		const manual = QUEST_DEFINITIONS.filter((q) => q.kind === 'manual');
		assert.equal(auto.length, 5);
		assert.equal(manual.length, 2);
	});

	test('every quest has a positive XP reward', () => {
		for (const quest of QUEST_DEFINITIONS) {
			assert.ok(quest.xpReward > 0);
		}
	});
});
