import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTaskByName, classifyCommandLine, isSuccessfulExit } from '../tracking/taskClassifier';

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

describe('classifyCommandLine', () => {
	test('classifies "mvn clean install" as build (the reported bug case)', () => {
		assert.equal(classifyCommandLine('mvn clean install'), 'build');
	});

	test('classifies other common Maven build phases as build', () => {
		assert.equal(classifyCommandLine('mvn package'), 'build');
		assert.equal(classifyCommandLine('mvn compile'), 'build');
		assert.equal(classifyCommandLine('./mvnw clean verify'), 'build');
	});

	test('classifies Maven test invocations as test', () => {
		assert.equal(classifyCommandLine('mvn test'), 'test');
		assert.equal(classifyCommandLine('mvn clean test'), 'test');
	});

	test('classifies Gradle build/test invocations correctly', () => {
		assert.equal(classifyCommandLine('./gradlew build'), 'build');
		assert.equal(classifyCommandLine('gradle assemble'), 'build');
		assert.equal(classifyCommandLine('./gradlew test'), 'test');
	});

	test('classifies common npm/yarn/pnpm scripts correctly', () => {
		assert.equal(classifyCommandLine('npm run build'), 'build');
		assert.equal(classifyCommandLine('yarn build'), 'build');
		assert.equal(classifyCommandLine('npm test'), 'test');
		assert.equal(classifyCommandLine('pnpm test'), 'test');
	});

	test('classifies other language build/test tools correctly', () => {
		assert.equal(classifyCommandLine('make'), 'build');
		assert.equal(classifyCommandLine('cargo build --release'), 'build');
		assert.equal(classifyCommandLine('cargo test'), 'test');
		assert.equal(classifyCommandLine('go build ./...'), 'build');
		assert.equal(classifyCommandLine('go test ./...'), 'test');
		assert.equal(classifyCommandLine('dotnet build'), 'build');
		assert.equal(classifyCommandLine('dotnet test'), 'test');
		assert.equal(classifyCommandLine('pytest'), 'test');
	});

	test('classifies unrelated commands as unknown', () => {
		assert.equal(classifyCommandLine('git status'), 'unknown');
		assert.equal(classifyCommandLine('ls -la'), 'unknown');
		assert.equal(classifyCommandLine('mvn clean'), 'unknown', 'clean alone is neither a build nor a test phase');
	});
});

describe('isSuccessfulExit', () => {
	test('exit code 0 is a success', () => {
		assert.equal(isSuccessfulExit(0), true);
	});

	test('a non-zero exit code is a failure', () => {
		assert.equal(isSuccessfulExit(1), false);
		assert.equal(isSuccessfulExit(127), false);
	});

	test('an undefined exit code (cancelled, or shell did not report one) is treated as a failure', () => {
		assert.equal(isSuccessfulExit(undefined), false);
	});
});
