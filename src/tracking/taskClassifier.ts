export type TaskKind = 'build' | 'test' | 'unknown';

const BUILD_NAME_PATTERN = /build|compile|bundle/i;
const TEST_NAME_PATTERN = /test|spec/i;

/**
 * Best-effort classification by task name alone. Callers with access to the
 * real `vscode.Task` should prefer comparing `task.group?.id` against the live
 * `vscode.TaskGroup.Build.id` / `.Test.id` constants first, and only fall back
 * to this heuristic when no group is set.
 */
export function classifyTaskByName(taskName: string): TaskKind {
	if (TEST_NAME_PATTERN.test(taskName)) {
		return 'test';
	}
	if (BUILD_NAME_PATTERN.test(taskName)) {
		return 'build';
	}
	return 'unknown';
}

// Command-line classification is stricter than the name-based heuristic above:
// real shell invocations rarely spell out "build"/"test" (e.g. `mvn clean install`),
// so common build-tool invocations are matched explicitly before falling back
// to the same loose keyword check.
const TEST_COMMAND_PATTERNS: ReadonlyArray<RegExp> = [
	/\bmvn(?:w)?(?:\.cmd)?\b.*\btest\b/i,
	/\b(?:gradlew?)\b.*\btest\b/i,
	/\bcargo\b.*\btest\b/i,
	/\bgo\b.*\btest\b/i,
	/\bdotnet\b.*\btest\b/i,
	/\b(?:npm|yarn|pnpm)\b.*\btest\b/i,
	/\b(?:pytest|jest|vitest|mocha)\b/i,
	TEST_NAME_PATTERN
];

const BUILD_COMMAND_PATTERNS: ReadonlyArray<RegExp> = [
	/\bmvn(?:w)?(?:\.cmd)?\b.*\b(?:install|package|compile|verify)\b/i,
	/\b(?:gradlew?)\b.*\b(?:build|assemble)\b/i,
	/\bmake\b/i,
	/\bcargo\b.*\bbuild\b/i,
	/\bgo\b.*\bbuild\b/i,
	/\bdotnet\b.*\bbuild\b/i,
	/\b(?:npm|yarn|pnpm)\b.*\bbuild\b/i,
	BUILD_NAME_PATTERN
];

/**
 * Classifies a raw shell command line (e.g. from Terminal Shell Integration),
 * as opposed to a VS Code task's display name. Checked against known build-tool
 * invocations first, then falls back to the same loose keyword match.
 */
export function classifyCommandLine(commandLine: string): TaskKind {
	if (TEST_COMMAND_PATTERNS.some((pattern) => pattern.test(commandLine))) {
		return 'test';
	}
	if (BUILD_COMMAND_PATTERNS.some((pattern) => pattern.test(commandLine))) {
		return 'build';
	}
	return 'unknown';
}

/**
 * Converts a process/shell exit code into a success flag. `undefined` covers
 * cases like the shell not reporting a code, a sub-shell being opened, or the
 * user cancelling with Ctrl+C — VS Code's own docs recommend treating these
 * as failures rather than successes, since there's no positive confirmation
 * the command actually completed.
 */
export function isSuccessfulExit(exitCode: number | undefined): boolean {
	return exitCode === 0;
}
