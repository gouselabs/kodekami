import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTaskByName } from '../tracking/taskClassifier';

describe('classifyTaskByName', () => {
	test('classifies names containing "test" as test', () => {
		assert.equal(classifyTaskByName('npm test'), 'test');
		assert.equal(classifyTaskByName('run-unit-tests'), 'test');
		assert.equal(classifyTaskByName('Spec Runner'), 'test');
	});

	test('classifies names containing "build" as build', () => {
		assert.equal(classifyTaskByName('npm run build'), 'build');
		assert.equal(classifyTaskByName('compile project'), 'build');
		assert.equal(classifyTaskByName('bundle assets'), 'build');
	});

	test('classifies unrelated names as unknown', () => {
		assert.equal(classifyTaskByName('deploy'), 'unknown');
		assert.equal(classifyTaskByName('lint'), 'unknown');
		assert.equal(classifyTaskByName(''), 'unknown');
	});

	test('is case-insensitive', () => {
		assert.equal(classifyTaskByName('BUILD'), 'build');
		assert.equal(classifyTaskByName('TEST'), 'test');
	});
});
