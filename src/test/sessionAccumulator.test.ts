import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SessionAccumulator } from '../tracking/SessionAccumulator';

describe('SessionAccumulator', () => {
	test('finalize computes duration in whole minutes', () => {
		const acc = new SessionAccumulator(0);
		const session = acc.finalize(5 * 60_000);
		assert.equal(session.durationMinutes, 5);
	});

	test('counts unique files touched, deduping repeated saves', () => {
		const acc = new SessionAccumulator(0);
		acc.recordFileTouched('file:///a.ts');
		acc.recordFileTouched('file:///a.ts');
		acc.recordFileTouched('file:///b.ts');
		const session = acc.finalize(60_000);
		assert.equal(session.filesTouched, 2);
	});

	test('tracks build attempts, successes, and failures separately', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(true);
		acc.recordBuild(false);
		acc.recordBuild(true);
		const session = acc.finalize(60_000);
		assert.equal(session.buildAttempts, 3);
		assert.equal(session.successfulBuilds, 2);
		assert.equal(session.failedBuilds, 1);
	});

	test('tracks test runs, successes, and failures separately', () => {
		const acc = new SessionAccumulator(0);
		acc.recordTest(true);
		acc.recordTest(false);
		const session = acc.finalize(60_000);
		assert.equal(session.testRuns, 2);
		assert.equal(session.successfulTests, 1);
		assert.equal(session.failedTests, 1);
	});

	test('counts commits', () => {
		const acc = new SessionAccumulator(0);
		acc.recordCommit();
		acc.recordCommit();
		const session = acc.finalize(60_000);
		assert.equal(session.commits, 2);
	});

	test('accumulates XP across multiple grants', () => {
		const acc = new SessionAccumulator(0);
		acc.addXp(5);
		acc.addXp(10);
		const session = acc.finalize(60_000);
		assert.equal(session.xpEarned, 15);
	});

	test('produces unique ids for different accumulators', () => {
		const a = new SessionAccumulator(0).finalize(1000);
		const b = new SessionAccumulator(0).finalize(1000);
		assert.notEqual(a.id, b.id);
	});

	test('marks the finalized session as completed', () => {
		const session = new SessionAccumulator(0).finalize(1000);
		assert.equal(session.completed, true);
	});

	test('getInProgressCounts reflects successes recorded so far, before the session ends', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(true);
		acc.recordBuild(false);
		acc.recordTest(true);
		acc.recordCommit();
		acc.recordCommit();

		assert.deepEqual(acc.getInProgressCounts(), { successfulBuilds: 1, successfulTests: 1, commits: 2, recoveries: 0 });
	});

	test('getInProgressCounts starts at all zeros', () => {
		const acc = new SessionAccumulator(0);
		assert.deepEqual(acc.getInProgressCounts(), { successfulBuilds: 0, successfulTests: 0, commits: 0, recoveries: 0 });
	});

	test('counts a recovery when a failed build is immediately followed by a successful one', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(false);
		acc.recordBuild(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 1);
	});

	test('counts a recovery when a failed test is immediately followed by a successful one', () => {
		const acc = new SessionAccumulator(0);
		acc.recordTest(false);
		acc.recordTest(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 1);
	});

	test('does not count a recovery for consecutive successes', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(true);
		acc.recordBuild(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 0);
	});

	test('does not double-count a recovery across repeated successes after one failure', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(false);
		acc.recordBuild(true);
		acc.recordBuild(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 1, 'only the failure->success transition counts, not every success after it');
	});

	test('build and test recoveries are tracked independently and both add to the same counter', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(false);
		acc.recordTest(false);
		acc.recordBuild(true);
		acc.recordTest(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 2);
	});

	test('a fresh failure after a recovery can be counted again', () => {
		const acc = new SessionAccumulator(0);
		acc.recordBuild(false);
		acc.recordBuild(true);
		acc.recordBuild(false);
		acc.recordBuild(true);
		const session = acc.finalize(60_000);
		assert.equal(session.recoveries, 2);
	});
});
