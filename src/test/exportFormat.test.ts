import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isValidExportEnvelope } from '../core/exportFormat';

describe('isValidExportEnvelope', () => {
	test('accepts a well-formed envelope', () => {
		const envelope = {
			exportVersion: 1,
			exportedAt: '2026-01-01T00:00:00.000Z',
			extensionVersion: '0.1.1',
			data: { profile: {} }
		};
		assert.equal(isValidExportEnvelope(envelope), true);
	});

	test('rejects null and non-object values', () => {
		assert.equal(isValidExportEnvelope(null), false);
		assert.equal(isValidExportEnvelope(undefined), false);
		assert.equal(isValidExportEnvelope('not an object'), false);
		assert.equal(isValidExportEnvelope(42), false);
	});

	test('rejects an object missing required fields', () => {
		assert.equal(isValidExportEnvelope({}), false);
		assert.equal(isValidExportEnvelope({ exportVersion: 1 }), false);
		assert.equal(isValidExportEnvelope({ exportVersion: 1, exportedAt: 'x' }), false);
	});

	test('rejects an envelope with the wrong field types', () => {
		assert.equal(
			isValidExportEnvelope({ exportVersion: '1', exportedAt: 'x', extensionVersion: '0.1.1', data: {} }),
			false
		);
	});

	test('rejects an envelope with no data payload', () => {
		assert.equal(
			isValidExportEnvelope({ exportVersion: 1, exportedAt: 'x', extensionVersion: '0.1.1', data: null }),
			false
		);
	});

	test('rejects an arbitrary unrelated JSON file', () => {
		assert.equal(isValidExportEnvelope({ some: 'other', shape: true }), false);
	});
});
