import * as vscode from 'vscode';
import { AnalyticsSnapshot, PeriodStatistics } from '../analytics/StatisticsTypes';
import { formatDuration } from '../utils/format';
import { escapeHtml } from '../utils/html';
import type { StorageService } from '../storage/storageService';
import { getCurrentTheme } from '../themes/ThemeService';
import { themeStyleBlock } from '../themes/themeCss';

const CHART_HEIGHT_PX = 80;

export class AnalyticsProvider {
	private panel: vscode.WebviewPanel | undefined;

	constructor(
		private readonly extensionUri: vscode.Uri,
		private readonly storage: StorageService
	) {}

	show(snapshot: AnalyticsSnapshot): void {
		if (!this.panel) {
			this.panel = vscode.window.createWebviewPanel(
				'codekamiAnalytics',
				'CodeKami Analytics',
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

		this.panel.webview.html = this.render(snapshot);
		this.panel.reveal();
	}

	private renderStatRows(stats: PeriodStatistics, includeAchievements: boolean): string {
		const rows = [
			['Coding time', formatDuration(stats.codingMinutes)],
			['Sessions', String(stats.sessions)],
			['Builds', `${stats.successfulBuilds} / ${stats.buildAttempts}`],
			['Tests', `${stats.successfulTests} / ${stats.testRuns}`],
			['Commits', String(stats.commits)],
			['XP', String(stats.xpEarned)]
		];
		if (includeAchievements) {
			rows.push(['Achievements', String(stats.achievementsUnlocked)]);
		}

		return rows
			.map(
				([label, value]) =>
					`<div class="row"><span class="label">${escapeHtml(label)}</span><span class="value">${escapeHtml(value)}</span></div>`
			)
			.join('\n');
	}

	private renderChart(snapshot: AnalyticsSnapshot): string {
		const maxMinutes = Math.max(1, ...snapshot.dailyActivity.map((day) => day.codingMinutes));

		const bars = snapshot.dailyActivity
			.map((day) => {
				const heightPx = Math.round((day.codingMinutes / maxMinutes) * CHART_HEIGHT_PX);
				const dayLabel = day.date.slice(5); // MM-DD
				return `<div class="bar-column">
					<div class="bar" style="height: ${Math.max(heightPx, day.codingMinutes > 0 ? 3 : 0)}px" title="${escapeHtml(dayLabel)}: ${formatDuration(day.codingMinutes)}"></div>
					<div class="bar-label">${escapeHtml(dayLabel)}</div>
				</div>`;
			})
			.join('\n');

		return `<div class="chart">${bars}</div>`;
	}

	private render(snapshot: AnalyticsSnapshot): string {
		const theme = getCurrentTheme(this.storage);

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
	<title>CodeKami Analytics</title>
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
		.grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 24px;
			max-width: 720px;
			margin: 0 auto 24px;
		}
		.card {
			border: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
			border-radius: 14px;
			padding: 20px;
			background: var(--ck-surface, var(--vscode-sideBar-background, #1e1e1e));
		}
		.card-title {
			font-size: 12px;
			letter-spacing: 2px;
			opacity: 0.7;
			text-transform: uppercase;
			margin-bottom: 12px;
		}
		.row {
			display: flex;
			justify-content: space-between;
			padding: 6px 0;
			border-top: 1px solid var(--ck-border, var(--vscode-widget-border, #333));
			font-size: 13px;
		}
		.row:first-of-type {
			border-top: none;
		}
		.label {
			opacity: 0.6;
			letter-spacing: 1px;
			text-transform: uppercase;
			font-size: 11px;
		}
		.value {
			color: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
			font-weight: 600;
		}
		.chart-card {
			max-width: 720px;
			margin: 0 auto;
		}
		.chart {
			display: flex;
			align-items: flex-end;
			gap: 6px;
			height: ${CHART_HEIGHT_PX}px;
			padding-top: 8px;
		}
		.bar-column {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-end;
			height: 100%;
		}
		.bar {
			width: 100%;
			max-width: 18px;
			background: var(--ck-primary, var(--vscode-textLink-foreground, #4fc3f7));
			border-radius: 3px 3px 0 0;
		}
		.bar-label {
			font-size: 9px;
			opacity: 0.55;
			margin-top: 6px;
			writing-mode: vertical-rl;
			transform: rotate(180deg);
		}
	</style>
</head>
<body>
	<div class="grid">
		<div class="card">
			<div class="card-title">This Week</div>
			${this.renderStatRows(snapshot.weekly, false)}
		</div>
		<div class="card">
			<div class="card-title">This Month</div>
			${this.renderStatRows(snapshot.monthly, true)}
		</div>
	</div>
	<div class="card chart-card">
		<div class="card-title">Coding Activity — Last 14 Days</div>
		${this.renderChart(snapshot)}
	</div>
</body>
</html>`;
	}
}
