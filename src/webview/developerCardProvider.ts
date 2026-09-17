import * as vscode from 'vscode';
import { CodeKamiProfile } from '../core/types';
import { getTitleForLevel } from '../core/levelSystem';
import { ACHIEVEMENTS } from '../core/achievementSystem';
import { findCharacterClassByName } from '../character/characterService';
import { escapeHtml } from '../utils/html';

export class DeveloperCardProvider {
	private panel: vscode.WebviewPanel | undefined;

	constructor(private readonly extensionUri: vscode.Uri) {}

	show(profile: CodeKamiProfile): void {
		if (!this.panel) {
			this.panel = vscode.window.createWebviewPanel(
				'codekamiDeveloperCard',
				'CodeKami Developer Card',
				vscode.ViewColumn.One,
				{
					enableScripts: false,
					localResourceRoots: [this.extensionUri]
				}
			);

			this.panel.onDidDispose(() => {
				this.panel = undefined;
			});
		}

		this.panel.webview.html = this.render(profile);
		this.panel.reveal();
	}

	private render(profile: CodeKamiProfile): string {
		const title = getTitleForLevel(profile.level);
		const name = profile.cardName ?? 'Anonymous Coder';
		const characterClass = findCharacterClassByName(profile.characterClass);
		const className = profile.characterClass ?? 'Unclassed';
		const weapon = characterClass?.weapon ?? 'Bare Hands';
		const achievementCount = profile.achievements.length;

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
	<title>CodeKami Developer Card</title>
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
			max-width: 360px;
			margin: 0 auto;
			border: 1px solid var(--vscode-widget-border, #333);
			border-radius: 14px;
			padding: 28px;
			background: var(--vscode-sideBar-background, #1e1e1e);
			text-align: center;
		}
		.rank {
			font-size: 13px;
			letter-spacing: 3px;
			opacity: 0.7;
			text-transform: uppercase;
			margin-bottom: 8px;
		}
		.name {
			font-size: 26px;
			font-weight: 700;
			margin-bottom: 4px;
		}
		.level {
			font-size: 13px;
			opacity: 0.7;
			margin-bottom: 20px;
		}
		.row {
			display: flex;
			justify-content: space-between;
			padding: 10px 0;
			border-top: 1px solid var(--vscode-widget-border, #333);
			font-size: 13px;
		}
		.row .label {
			opacity: 0.6;
			letter-spacing: 1px;
			text-transform: uppercase;
		}
		.row .value {
			color: var(--vscode-textLink-foreground, #4fc3f7);
			font-weight: 600;
		}
		.stats {
			margin-top: 16px;
			font-size: 12px;
			opacity: 0.85;
			display: flex;
			justify-content: space-around;
		}
		.footer {
			margin-top: 20px;
			font-size: 11px;
			letter-spacing: 2px;
			opacity: 0.5;
		}
		.hint {
			max-width: 360px;
			margin: 14px auto 0;
			font-size: 12px;
			opacity: 0.6;
			text-align: center;
		}
	</style>
</head>
<body>
	<div class="card">
		<div class="rank">${escapeHtml(title)}</div>
		<div class="name">${escapeHtml(name)}</div>
		<div class="level">Level ${profile.level}</div>
		<div class="row"><span class="label">Class</span><span class="value">${escapeHtml(className)}</span></div>
		<div class="row"><span class="label">Weapon</span><span class="value">${escapeHtml(weapon)}</span></div>
		<div class="stats">
			<span>🔥 ${profile.streak} Day Streak</span>
			<span>🏆 ${achievementCount} / ${ACHIEVEMENTS.length}</span>
			<span>✨ ${profile.totalXp} XP</span>
		</div>
		<div class="footer">CODEKAMI</div>
	</div>
	<div class="hint">Copied as plain text to your clipboard — paste it anywhere to share.</div>
</body>
</html>`;
	}
}
