import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { codeKamiEvents, CodeKamiEvent } from '../events/codeKamiEvents';
import { isQuestCompleted, completeQuest } from '../core/questProgress';
import { findQuest, QuestDefinition } from '../core/quests';
import type { QuestStateStorage } from '../core/questTypes';
import { grantXp, GrantXpResult } from '../core/xpSystem';
import type { AchievementContext } from '../core/achievementSystem';
import { log } from '../utils/logger';

export class QuestService implements vscode.Disposable {
	private readonly subscription: vscode.Disposable;

	constructor(
		private readonly storage: StorageService,
		private readonly onXpGranted: (result: GrantXpResult, context: AchievementContext) => void,
		private readonly onQuestCompleted: (quest: QuestDefinition) => void
	) {
		this.subscription = codeKamiEvents.onEvent((event) => this.handleEvent(event));
	}

	getTodayState(): QuestStateStorage {
		return this.storage.getQuestState();
	}

	async completeManualQuest(questId: string): Promise<boolean> {
		const quest = findQuest(questId);
		if (!quest || quest.kind !== 'manual') {
			return false;
		}
		return this.completeQuestById(questId);
	}

	private async completeQuestById(questId: string): Promise<boolean> {
		const state = this.storage.getQuestState();
		if (!state.questIds.includes(questId) || isQuestCompleted(state, questId)) {
			return false;
		}

		const quest = findQuest(questId);
		if (!quest) {
			return false;
		}

		await this.storage.saveQuestState(completeQuest(state, questId));
		log(`Quest completed: ${quest.id}`);
		this.onQuestCompleted(quest);

		const result = await grantXp(this.storage, quest.xpReward);
		this.onXpGranted(result, {});
		return true;
	}

	private handleEvent(event: CodeKamiEvent): void {
		switch (event.type) {
			case 'commit':
				void this.completeQuestById('commit-once');
				return;
			case 'taskCompleted':
				if (event.kind === 'build' && event.success) {
					void this.completeQuestById('clean-build');
				}
				if (event.kind === 'test' && event.success) {
					void this.completeQuestById('tests-pass');
				}
				return;
			case 'sessionEnded':
				if (event.session.durationMinutes >= 30) {
					void this.completeQuestById('thirty-minutes');
				}
				return;
			case 'focusCompleted':
				void this.completeQuestById('finish-focus');
				return;
			default:
				return;
		}
	}

	dispose(): void {
		this.subscription.dispose();
	}
}
