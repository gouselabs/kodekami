import { TaskKind } from './taskClassifier';

const DUPLICATE_WINDOW_MS = 3000;

/**
 * A `shell` task typically runs inside an integrated terminal too, so both the
 * Tasks tracker and the Terminal Shell Integration tracker can fire for the
 * exact same build. This suppresses a second identical (kind, success) signal
 * arriving shortly after the first, rather than double-counting one build.
 */
export class TaskCompletionDeduper {
	private lastSignalKey: string | undefined;
	private lastSignalAt = 0;

	shouldSuppress(kind: TaskKind, success: boolean, now: number): boolean {
		const key = `${kind}:${success}`;
		if (this.lastSignalKey === key && now - this.lastSignalAt < DUPLICATE_WINDOW_MS) {
			return true;
		}
		this.lastSignalKey = key;
		this.lastSignalAt = now;
		return false;
	}
}
