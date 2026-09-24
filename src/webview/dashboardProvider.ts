import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { getTitleForLevel, xpRequiredForLevel } from '../core/levelSystem';
import { ACHIEVEMENTS } from '../core/achievementSystem';
import { escapeHtml } from '../utils/html';
import { findCompanionType } from '../companion/companions';
import { getCurrentTheme } from '../themes/ThemeService';
import { themeStyleBlock } from '../themes/themeCss';
import { getDailyMessage } from '../content/DailyContentService';
import { getSettings } from '../utils/settings';
import { getTodaysQuestViews } from '../core/questProgress';

export class DashboardProvider {
	private panel: vscode.WebviewPanel | undefined;

	constructor(
		private readonly extensionUri: vscode.Uri,
		private readonly storage: StorageService
	) {}

	show(): void {
		if (this.panel) {
			this.panel.reveal();
			return;
		}

		this.panel = vscode.window.createWebviewPanel(
			'codekamiDashboard',
			'CodeKami',
			vscode.ViewColumn.One,
			{
				enableScripts: false,
				retainContextWhenHidden: true,
				localResourceRoots: [this.extensionUri]
			}
		);

		this.panel.webview.html = this.render();

		this.panel.onDidDispose(() => {
			this.panel = undefined;
		});
	}

	refresh(): void {
		if (this.panel) {
			this.panel.webview.html = this.render();
		}
	}

	private render(): string {
		const profile = this.storage.getProfile();
		const characterClass = profile.characterClass ?? 'No Class Selected — run "CodeKami: Change Character"';
		const title = getTitleForLevel(profile.level);
		const xpNeeded = xpRequiredForLevel(profile.level);
		const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));
		const achievementCount = profile.achievements.length;
		const companionState = this.storage.getCompanionState();
		const companion = findCompanionType(companionState.selectedCompanionId);
		const theme = getCurrentTheme(this.storage);
		const dailyMessage = getSettings().showDailyMotivation ? getDailyMessage() : undefined;
		const questViews = getTodaysQuestViews(this.storage.getQuestState());

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
	<title>CodeKami</title>
	<style>
		:root {
			color-scheme: dark;
		}
		${themeStyleBlock(theme)}
		body {
			font-family: var(--vscode-font-family);
			color: var(--ck-text, var(--vscode-foreground));
			background-color: var(--ck-background, var(--vscode-editor-background));
			padding: 32px;
		}
		.card {
			max-width: 420px;
			margin: 0 auto;
			border: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
			border-radius: 10px;
			padding: 24px;
			background: var(--ck-surface, var(--vscode-sideBar-background, #1e1e1e));
		}
		.title {
			font-size: 13px;
			letter-spacing: 2px;
			opacity: 0.7;
			text-transform: uppercase;
			margin-bottom: 16px;
		}
		.class {
			font-size: 14px;
			color: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
			margin-bottom: 4px;
		}
		.level {
			font-size: 24px;
			font-weight: 600;
			margin-bottom: 16px;
		}
		.bar-track {
			width: 100%;
			height: 10px;
			border-radius: 5px;
			background: var(--vscode-progressBar-background, #333);
			overflow: hidden;
			margin-bottom: 6px;
		}
		.bar-fill {
			height: 100%;
			width: ${xpPercent}%;
			background: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
		}
		.xp-label {
			font-size: 12px;
			opacity: 0.7;
			margin-bottom: 16px;
		}
		.streak {
			font-size: 13px;
			opacity: 0.85;
			margin-bottom: 4px;
		}
		.achievements {
			font-size: 13px;
			opacity: 0.85;
			margin-bottom: 4px;
		}
		.companion {
			font-size: 13px;
			opacity: 0.85;
		}
		.quests {
			margin-top: 18px;
			padding-top: 16px;
			border-top: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
		}
		.quests-title {
			font-size: 11px;
			letter-spacing: 2px;
			opacity: 0.6;
			text-transform: uppercase;
			margin-bottom: 8px;
		}
		.quest-row {
			font-size: 13px;
			padding: 3px 0;
			opacity: 0.9;
		}
		.quest-row.completed {
			opacity: 0.55;
			text-decoration: line-through;
		}
		.quest-manual-note {
			opacity: 0.6;
			font-size: 11px;
		}
		.motivation {
			margin-top: 18px;
			padding-top: 16px;
			border-top: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
		}
		.motivation-title {
			font-size: 11px;
			letter-spacing: 2px;
			opacity: 0.6;
			text-transform: uppercase;
			margin-bottom: 8px;
		}
		.motivation-text {
			font-size: 13px;
			font-style: italic;
			line-height: 1.5;
		}
		.motivation-signature {
			margin-top: 6px;
			font-size: 11px;
			opacity: 0.5;
			text-align: right;
		}
	</style>
</head>
<body>
	<div class="card">
		<div class="title">CodeKami</div>
		<div class="class">${escapeHtml(characterClass)}</div>
		<div class="level">Level ${profile.level} — ${escapeHtml(title)}</div>
		<div class="bar-track"><div class="bar-fill"></div></div>
		<div class="xp-label">${profile.xp} / ${xpNeeded} XP (Total: ${profile.totalXp})</div>
		<div class="streak">🔥 ${profile.streak} Day Streak</div>
		<div class="achievements">🏆 ${achievementCount} / ${ACHIEVEMENTS.length} Achievements</div>
		${companion ? `<div class="companion">${companion.emoji} ${escapeHtml(companion.name)}</div>` : ''}
		<div class="companion">🎨 ${escapeHtml(theme.name)}</div>
		<div class="quests">
			<div class="quests-title">📋 Today's Quests</div>
			${questViews
				.map((view) => {
					const manualNote =
						view.quest.kind === 'manual' && !view.completed
							? ` <span class="quest-manual-note">— mark via "CodeKami: Complete Quest"</span>`
							: '';
					return `<div class="quest-row${view.completed ? ' completed' : ''}">${view.completed ? '✅' : '⬜'} ${view.quest.icon} ${escapeHtml(view.quest.name)}${manualNote}</div>`;
				})
				.join('')}
		</div>
		${
			dailyMessage
				? `<div class="motivation">
			<div class="motivation-title">⚔ Daily Motivation</div>
			<div class="motivation-text">"${escapeHtml(dailyMessage.text)}"</div>
			<div class="motivation-signature">— CodeKami</div>
		</div>`
				: ''
		}
	</div>
</body>
</html>`;
	}
}
