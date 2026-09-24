import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { codeKamiEvents, CodeKamiEvent } from '../events/codeKamiEvents';
import { deriveMoodFromEvent, getMoodEmoji, CompanionMood } from './CompanionMood';
import { COMPANION_TYPES, findCompanionType, CompanionType } from './companions';
import { getSettings } from '../utils/settings';

const MOOD_DISPLAY_MS = 6000;

export class CompanionService implements vscode.Disposable {
	private readonly statusBarItem: vscode.StatusBarItem;
	private readonly subscription: vscode.Disposable;
	private mood: CompanionMood = 'idle';
	private revertTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(private readonly storage: StorageService) {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
		this.statusBarItem.command = 'codekami.openDashboard';
		this.subscription = codeKamiEvents.onEvent((event) => this.handleEvent(event));
		this.refresh();
	}

	getCompanion(): CompanionType {
		const state = this.storage.getCompanionState();
		return findCompanionType(state.selectedCompanionId) ?? COMPANION_TYPES[0];
	}

	getMood(): CompanionMood {
		return this.mood;
	}

	refresh(): void {
		if (!getSettings().showCompanion) {
			this.statusBarItem.hide();
			return;
		}
		const companion = this.getCompanion();
		this.statusBarItem.text = this.mood === 'idle' ? companion.emoji : getMoodEmoji(this.mood);
		this.statusBarItem.tooltip = `CodeKami Companion: ${companion.name} (${this.mood}) — click to open the dashboard`;
		this.statusBarItem.show();
	}

	private handleEvent(event: CodeKamiEvent): void {
		const mood = deriveMoodFromEvent(event);
		if (!mood) {
			return;
		}
		this.setMood(mood);
	}

	private setMood(mood: CompanionMood): void {
		this.mood = mood;
		this.refresh();

		if (this.revertTimeout) {
			clearTimeout(this.revertTimeout);
		}
		this.revertTimeout = setTimeout(() => {
			this.mood = 'idle';
			this.refresh();
		}, MOOD_DISPLAY_MS);
	}

	dispose(): void {
		this.subscription.dispose();
		this.statusBarItem.dispose();
		if (this.revertTimeout) {
			clearTimeout(this.revertTimeout);
		}
	}
}
