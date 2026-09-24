import * as vscode from 'vscode';
import type { QuestService } from '../quests/QuestService';
import { getTodaysQuestViews } from '../core/questProgress';

export async function promptCompleteQuest(questService: QuestService): Promise<void> {
	const state = questService.getTodayState();
	const manualIncomplete = getTodaysQuestViews(state).filter((view) => view.quest.kind === 'manual' && !view.completed);

	if (manualIncomplete.length === 0) {
		void vscode.window.showInformationMessage('No manual quests left to complete today.');
		return;
	}

	const picked = await vscode.window.showQuickPick(
		manualIncomplete.map((view) => ({
			label: `${view.quest.icon} ${view.quest.name}`,
			description: view.quest.description,
			id: view.quest.id
		})),
		{ title: 'CodeKami: Complete Quest', placeHolder: 'Which quest did you finish?' }
	);
	if (!picked) {
		return;
	}

	await questService.completeManualQuest(picked.id);
}
