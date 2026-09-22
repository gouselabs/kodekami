import * as vscode from 'vscode';
import { CodingSession } from '../core/sessionTypes';
import { escapeHtml } from '../utils/html';
import { formatDuration } from '../utils/format';
import type { StorageService } from '../storage/storageService';
import { getCurrentTheme } from '../themes/ThemeService';
import { themeStyleBlock } from '../themes/themeCss';

export class SessionSummaryProvider {
	private panel: vscode.WebviewPanel | undefined;

	constructor(
		private readonly extensionUri: vscode.Uri,
		private readonly storage: StorageService
	) {}

	show(session: CodingSession, streak: number): void {
		if (!this.panel) {
			this.panel = vscode.window.createWebviewPanel(
				'codekamiSessionSummary',
				'CodeKami Session Summary',
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

		this.panel.webview.html = this.render(session, streak);
		this.panel.reveal();
	}

	private render(session: CodingSession, streak: number): string {
		const theme = getCurrentTheme(this.storage);

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
	<title>CodeKami Session Summary</title>
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
			max-width: 380px;
			margin: 0 auto;
			border: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
			border-radius: 14px;
			padding: 28px;
			background: var(--ck-surface, var(--vscode-sideBar-background, #1e1e1e));
			text-align: center;
		}
		.title {
			font-size: 13px;
			letter-spacing: 3px;
			opacity: 0.7;
			text-transform: uppercase;
			margin-bottom: 20px;
		}
		.row {
			display: flex;
			justify-content: space-between;
			padding: 10px 0;
			border-top: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
			font-size: 13px;
		}
		.row .label {
			opacity: 0.6;
			letter-spacing: 1px;
			text-transform: uppercase;
		}
		.row .value {
			color: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
			font-weight: 600;
		}
		.xp {
			margin-top: 16px;
			font-size: 20px;
			font-weight: 700;
			color: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
		}
		.streak {
			margin-top: 8px;
			font-size: 13px;
			opacity: 0.85;
		}
		.footer {
			margin-top: 20px;
			font-size: 11px;
			letter-spacing: 2px;
			opacity: 0.5;
		}
	</style>
</head>
<body>
	<div class="card">
		<div class="title">⚔ Session Complete</div>
		<div class="row"><span class="label">Duration</span><span class="value">${escapeHtml(formatDuration(session.durationMinutes))}</span></div>
		<div class="row"><span class="label">Files touched</span><span class="value">${session.filesTouched}</span></div>
		<div class="row"><span class="label">Builds</span><span class="value">${session.successfulBuilds} / ${session.buildAttempts}</span></div>
		<div class="row"><span class="label">Tests</span><span class="value">${session.successfulTests} / ${session.testRuns}</span></div>
		<div class="row"><span class="label">Commits</span><span class="value">${session.commits}</span></div>
		<div class="xp">+${session.xpEarned} XP</div>
		<div class="streak">🔥 ${streak} Day Streak</div>
		<div class="footer">CODEKAMI</div>
	</div>
</body>
</html>`;
	}
}
