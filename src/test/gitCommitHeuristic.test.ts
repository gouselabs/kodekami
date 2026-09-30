import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isLikelyCommit } from '../tracking/gitCommitHeuristic';

describe('isLikelyCommit', () => {
	test('a real commit: HEAD moves and previously-staged/dirty changes are now clear', () => {
		assert.equal(
			isLikelyCommit({ commitChanged: true, hadPendingChanges: true, nowHasPendingChanges: false }),
			true
		);
	});

	test('a pull/merge/rebase/checkout on a clean tree: HEAD moves but there was nothing pending to clear', () => {
		assert.equal(
			isLikelyCommit({ commitChanged: true, hadPendingChanges: false, nowHasPendingChanges: false }),
			false
		);
	});

	test('staging a file without committing: pending changes appear but HEAD does not move', () => {
		assert.equal(
			isLikelyCommit({ commitChanged: false, hadPendingChanges: false, nowHasPendingChanges: true }),
			false
		);
	});

	test('HEAD moves while changes remain pending (e.g. a merge that leaves conflicts): not counted as a commit', () => {
		assert.equal(
			isLikelyCommit({ commitChanged: true, hadPendingChanges: true, nowHasPendingChanges: true }),
			false
		);
	});

	test('no change at all', () => {
		assert.equal(
			isLikelyCommit({ commitChanged: false, hadPendingChanges: true, nowHasPendingChanges: true }),
			false
		);
	});
});
