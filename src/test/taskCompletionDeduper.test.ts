import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TaskCompletionDeduper } from '../tracking/TaskCompletionDeduper';

describe('TaskCompletionDeduper', () => {
	test('does not suppress the first signal', () => {
		const deduper = new TaskCompletionDeduper();
		assert.equal(deduper.shouldSuppress('build', true, 1000), false);
	});

	test('suppresses an identical (kind, success) signal shortly after', () => {
		const deduper = new TaskCompletionDeduper();
		deduper.shouldSuppress('build', true, 1000);
		assert.equal(deduper.shouldSuppress('build', true, 1000 + 500), true);
	});

	test('does not suppress once the duplicate window has elapsed', () => {
		const deduper = new TaskCompletionDeduper();
		deduper.shouldSuppress('build', true, 1000);
		assert.equal(deduper.shouldSuppress('build', true, 1000 + 3000), false);
	});

	test('does not suppress a different outcome for the same kind', () => {
		const deduper = new TaskCompletionDeduper();
		deduper.shouldSuppress('build', true, 1000);
		assert.equal(deduper.shouldSuppress('build', false, 1000 + 100), false, 'a failure right after a success is not a duplicate');
	});

	test('does not suppress a different kind at the same moment', () => {
		const deduper = new TaskCompletionDeduper();
		deduper.shouldSuppress('build', true, 1000);
		assert.equal(deduper.shouldSuppress('test', true, 1000), false);
	});
});
