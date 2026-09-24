import * as vscode from 'vscode';
import { classifyCommandLine, isSuccessfulExit } from './taskClassifier';
import { reportTaskCompletion } from './reportTaskCompletion';
import { log } from '../utils/logger';
import type { SessionTrackerService } from './sessionTracker';

const noopDisposable: vscode.Disposable = { dispose: () => undefined };

/**
 * Detects build/test commands run directly in a terminal (e.g. `mvn clean install`
 * typed by hand), which the VS Code Tasks API never sees since it only knows
 * about tasks.json-defined or auto-detected tasks. Requires terminal shell
 * integration to be active for that terminal (on by default for common shells).
 */
export function registerTerminalCommandTracker(sessionTracker: SessionTrackerService): vscode.Disposable {
	if (!vscode.window.onDidEndTerminalShellExecution) {
		log('Terminal shell integration API not available; raw terminal command detection disabled');
		return noopDisposable;
	}

	return vscode.window.onDidEndTerminalShellExecution((event) => {
		const commandLine = event.execution.commandLine.value;
		const kind = classifyCommandLine(commandLine);
		if (kind === 'unknown') {
			return;
		}

		reportTaskCompletion(sessionTracker, kind, isSuccessfulExit(event.exitCode));
	});
}
