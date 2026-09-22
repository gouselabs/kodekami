import * as vscode from 'vscode';
import { codeKamiEvents, CodeKamiEvent } from '../events/codeKamiEvents';
import { pickReaction } from './ReactionEngine';
import { ReactionCooldown } from './ReactionCooldown';
import { AnimeReaction, ReactionEventType } from './reactions';
import { getSettings, CodeKamiSettings } from '../utils/settings';
import { LONG_SESSION_MINUTES } from '../core/config';

const STATUS_BAR_DISPLAY_MS = 4000;

export class ReactionService implements vscode.Disposable {
	private readonly cooldown = new ReactionCooldown();
	private readonly statusBarItem: vscode.StatusBarItem;
	private readonly subscription: vscode.Disposable;
	private hideTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
		this.subscription = codeKamiEvents.onEvent((event) => this.handleEvent(event));
	}

	private handleEvent(event: CodeKamiEvent): void {
		const settings = getSettings();
		if (!settings.showReactions) {
			return;
		}

		switch (event.type) {
			case 'levelUp':
				// Level-up and achievement reactions always bypass the cooldown.
				this.present(pickReaction('levelUp'), settings);
				return;
			case 'achievementUnlocked':
				this.present(pickReaction('achievementUnlocked'), settings);
				return;
			case 'taskCompleted': {
				if (event.kind === 'unknown') {
					return;
				}
				const reactionEvent: ReactionEventType =
					event.kind === 'build'
						? event.success
							? 'buildSuccess'
							: 'buildFailure'
						: event.success
							? 'testSuccess'
							: 'testFailure';
				this.presentWithCooldown(reactionEvent, settings);
				return;
			}
			case 'commit':
				this.presentWithCooldown('commit', settings);
				return;
			case 'sessionEnded':
				if (event.session.durationMinutes >= LONG_SESSION_MINUTES) {
					this.presentWithCooldown('longSession', settings);
				}
				return;
			case 'sessionStarted':
				if (event.isReturn) {
					this.presentWithCooldown('returnAfterInactivity', settings);
				}
				return;
			default:
				return;
		}
	}

	private presentWithCooldown(reactionEvent: ReactionEventType, settings: CodeKamiSettings): void {
		const now = Date.now();
		if (!this.cooldown.canShow(now, settings.reactionCooldownMs)) {
			return;
		}
		const reaction = pickReaction(reactionEvent);
		if (!reaction) {
			return;
		}
		this.cooldown.markShown(now);
		this.present(reaction, settings);
	}

	private present(reaction: AnimeReaction | undefined, settings: CodeKamiSettings): void {
		if (!reaction) {
			return;
		}
		if (settings.reactionMode === 'notification' || settings.reactionMode === 'both') {
			void vscode.window.showInformationMessage(reaction.message);
		}
		if (settings.reactionMode === 'statusBar' || settings.reactionMode === 'both') {
			this.showStatusBarReaction(reaction.message);
		}
	}

	private showStatusBarReaction(message: string): void {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
		}
		this.statusBarItem.text = message;
		this.statusBarItem.show();
		this.hideTimeout = setTimeout(() => {
			this.statusBarItem.hide();
		}, STATUS_BAR_DISPLAY_MS);
	}

	dispose(): void {
		this.subscription.dispose();
		this.statusBarItem.dispose();
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
		}
	}
}
