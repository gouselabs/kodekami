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
