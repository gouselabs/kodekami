import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDailyMessage } from '../content/DailyContentService';
import { DAILY_MESSAGES } from '../content/dailyMotivation';

describe('getDailyMessage', () => {
	test('returns the same message for different times on the same local day', () => {
		const morning = new Date(2026, 0, 15, 6, 0, 0);
		const night = new Date(2026, 0, 15, 23, 45, 0);

		assert.equal(getDailyMessage(morning).id, getDailyMessage(night).id);
	});

	test('is deterministic across repeated calls for the same date', () => {
		const date = new Date(2026, 2, 3);
		assert.equal(getDailyMessage(date).id, getDailyMessage(date).id);
	});

	test('always returns a message that exists in the catalog', () => {
		const message = getDailyMessage(new Date(2026, 5, 20));
		assert.ok(DAILY_MESSAGES.some((m) => m.id === message.id));
	});

	test('can select a different message on a different day', () => {
		// Not guaranteed for every pair of dates, but across a wide spread of
		// consecutive days we should see more than one distinct message.
		const ids = new Set<string>();
		for (let day = 1; day <= 30; day++) {
			ids.add(getDailyMessage(new Date(2026, 0, day)).id);
		}
		assert.ok(ids.size > 1, 'expected variety across a month of days');
	});
});

describe('DAILY_MESSAGES', () => {
	test('every message has non-empty original text and a category', () => {
		for (const message of DAILY_MESSAGES) {
			assert.ok(message.text.length > 0);
			assert.ok(message.category.length > 0);
		}
	});

	test('message ids are unique', () => {
		const ids = DAILY_MESSAGES.map((m) => m.id);
		assert.equal(ids.length, new Set(ids).size);
	});
});
