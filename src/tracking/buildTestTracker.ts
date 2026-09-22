import * as vscode from 'vscode';
import { classifyTaskByName, TaskKind } from './taskClassifier';
import { codeKamiEvents } from '../events/codeKamiEvents';
import type { SessionTrackerService } from './sessionTracker';

function classifyTask(task: vscode.Task): TaskKind {
	if (task.group?.id === vscode.TaskGroup.Build.id) {
		return 'build';
	}
	if (task.group?.id === vscode.TaskGroup.Test.id) {
		return 'test';
	}
	return classifyTaskByName(task.name);
}

export function registerBuildTestTracker(sessionTracker: SessionTrackerService): vscode.Disposable {
	return vscode.tasks.onDidEndTaskProcess((event) => {
		const kind = classifyTask(event.execution.task);
		if (kind === 'unknown') {
			return;
		}

		const success = event.exitCode === 0;
		sessionTracker.recordBuildOrTest(kind, success);
		codeKamiEvents.emit({ type: 'taskCompleted', kind, success });
	});
}
