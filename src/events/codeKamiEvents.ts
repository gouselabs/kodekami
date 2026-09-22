import * as vscode from 'vscode';
import type { GrantXpResult } from '../core/xpSystem';
import type { AchievementContext, AchievementDefinition } from '../core/achievementSystem';
import type { CodingSession } from '../core/sessionTypes';
import type { TaskKind } from '../tracking/taskClassifier';

export type CodeKamiEvent =
	| { type: 'xpGranted'; result: GrantXpResult; context: AchievementContext }
	| { type: 'levelUp'; level: number; title: string }
	| { type: 'achievementUnlocked'; achievement: AchievementDefinition }
	| { type: 'streakMilestone'; milestone: number }
	| { type: 'sessionEnded'; session: CodingSession }
	| { type: 'sessionStarted'; isReturn: boolean }
	| { type: 'taskCompleted'; kind: TaskKind; success: boolean }
	| { type: 'commit' };

class CodeKamiEventEmitter implements vscode.Disposable {
	private readonly emitter = new vscode.EventEmitter<CodeKamiEvent>();
	readonly onEvent = this.emitter.event;

	emit(event: CodeKamiEvent): void {
		this.emitter.fire(event);
	}

	dispose(): void {
		this.emitter.dispose();
	}
}

export const codeKamiEvents = new CodeKamiEventEmitter();
