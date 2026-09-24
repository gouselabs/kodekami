import * as vscode from 'vscode';
import { escapeHtml } from '../utils/html';
import { FocusTimer, FocusSession } from '../focus/FocusTimer';
import { findBoss } from '../core/bosses';
import type { StorageService } from '../storage/storageService';
import { getCurrentTheme } from '../themes/ThemeService';
import { themeStyleBlock } from '../themes/themeCss';

function formatCountdown(ms: number): string {
	const totalSeconds = Math.max(0, Math.round(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export class FocusPanelProvider {
	private panel: vscode.WebviewPanel | undefined;

	constructor(
		private readonly extensionUri: vscode.Uri,
		private readonly storage: StorageService
	) {}

	showLive(timer: FocusTimer, nowMs: number, options: { reveal?: boolean } = {}): void {
		this.ensurePanel();
		this.panel!.webview.html = this.renderLive(timer, nowMs);
		if (options.reveal) {
			this.panel!.reveal(vscode.ViewColumn.Beside, true);
		}
	}

	showResult(session: FocusSession): void {
		this.ensurePanel();
		this.panel!.webview.html = this.renderResult(session);
		this.panel!.reveal(vscode.ViewColumn.Beside, true);
	}

	private ensurePanel(): void {
		if (this.panel) {
			return;
		}
		this.panel = vscode.window.createWebviewPanel('codekamiFocus', 'CodeKami Focus', vscode.ViewColumn.Beside, {
			enableScripts: false,
			localResourceRoots: [this.extensionUri]
		});
		this.panel.onDidDispose(() => {
			this.panel = undefined;
		});
	}

	private shell(title: string, body: string): string {
		const theme = getCurrentTheme(this.storage);

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
	<title>${escapeHtml(title)}</title>
	<style>
		:root { color-scheme: dark; }
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
		.title { font-size: 13px; letter-spacing: 3px; opacity: 0.7; text-transform: uppercase; margin-bottom: 20px; }
		.emoji { font-size: 48px; margin-bottom: 12px; }
		.countdown { font-size: 36px; font-weight: 700; color: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7)); margin-bottom: 16px; }
		.bar-track { width: 100%; height: 14px; border-radius: 7px; background: var(--vscode-progressBar-background, #333); overflow: hidden; margin-bottom: 8px; }
		.bar-fill { height: 100%; background: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7)); }
		.label { font-size: 12px; opacity: 0.7; margin-bottom: 16px; }
		.flavor { font-size: 13px; font-style: italic; opacity: 0.85; margin-top: 12px; }
		.footer { margin-top: 20px; font-size: 11px; letter-spacing: 2px; opacity: 0.5; }
	</style>
</head>
<body>
	<div class="card">
		${body}
		<div class="footer">CODEKAMI</div>
	</div>
</body>
</html>`;
	}

	private renderLive(timer: FocusTimer, nowMs: number): string {
		const boss = timer.bossId ? findBoss(timer.bossId) : undefined;
		const remainingMs = timer.getRemainingMs(nowMs);
		const hpPercent = timer.getBossHpPercent(nowMs);

		const body = boss
			? `<div class="title">⚔ Boss Battle</div>
			<div class="emoji">${boss.emoji}</div>
			<div class="label">${escapeHtml(boss.name)}</div>
			<div class="bar-track"><div class="bar-fill" style="width: ${hpPercent}%"></div></div>
			<div class="label">${hpPercent}% HP remaining</div>
			<div class="countdown">${formatCountdown(remainingMs)}</div>
			<div class="flavor">"${escapeHtml(boss.flavorText)}"</div>`
			: `<div class="title">🎯 Focus Mode</div>
			<div class="bar-track"><div class="bar-fill" style="width: ${hpPercent}%"></div></div>
			<div class="countdown">${formatCountdown(remainingMs)}</div>
			<div class="label">Stay locked in.</div>`;

		return this.shell(boss ? 'CodeKami Boss Battle' : 'CodeKami Focus', body);
	}

	private renderResult(session: FocusSession): string {
		const boss = session.bossId ? findBoss(session.bossId) : undefined;
		const won = session.outcome !== 'cancelled';

		const body = boss
			? `<div class="title">${won ? '🏆 Victory' : '🏳️ Retreated'}</div>
			<div class="emoji">${won ? '✨' : boss.emoji}</div>
			<div class="label">${won ? `Defeated ${escapeHtml(boss.name)}!` : `Fled from ${escapeHtml(boss.name)}.`}</div>
			<div class="countdown">${won ? `+${session.xpEarned} XP` : 'No XP'}</div>
			<div class="label">${session.elapsedMinutes.toFixed(1)} minutes focused</div>`
			: `<div class="title">${won ? '🎯 Focus Complete' : '⏹ Focus Ended'}</div>
			<div class="countdown">${won ? `+${session.xpEarned} XP` : 'No XP'}</div>
			<div class="label">${session.elapsedMinutes.toFixed(1)} minutes focused</div>`;

		return this.shell('CodeKami Focus', body);
	}
}
