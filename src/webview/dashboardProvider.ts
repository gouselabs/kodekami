import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { getTitleForLevel, xpRequiredForLevel } from '../core/levelSystem';
import { ACHIEVEMENTS } from '../core/achievementSystem';
import { escapeHtml } from '../utils/html';

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
		body {
			font-family: var(--vscode-font-family);
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
			padding: 32px;
		}
		.card {
			max-width: 420px;
			margin: 0 auto;
			border: 1px solid var(--vscode-widget-border, #333);
			border-radius: 10px;
			padding: 24px;
			background: var(--vscode-sideBar-background, #1e1e1e);
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
			color: var(--vscode-textLink-foreground, #4fc3f7);
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
			background: var(--vscode-textLink-foreground, #4fc3f7);
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
	</div>
</body>
</html>`;
	}
}
