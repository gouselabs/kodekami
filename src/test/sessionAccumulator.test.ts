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
});
