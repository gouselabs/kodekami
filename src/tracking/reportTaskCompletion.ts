import { codeKamiEvents } from '../events/codeKamiEvents';
import type { SessionTrackerService } from './sessionTracker';
import type { TaskKind } from './taskClassifier';
import { TaskCompletionDeduper } from './TaskCompletionDeduper';

const deduper = new TaskCompletionDeduper();

export function reportTaskCompletion(sessionTracker: SessionTrackerService, kind: TaskKind, success: boolean): void {
	if (kind === 'unknown') {
		return;
	}
	if (deduper.shouldSuppress(kind, success, Date.now())) {
		return;
	}

	sessionTracker.recordBuildOrTest(kind, success);
	codeKamiEvents.emit({ type: 'taskCompleted', kind, success });
}
