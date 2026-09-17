import * as vscode from 'vscode';
import { CodeKamiProfile } from '../core/types';

export class StatusBarService {
	private readonly item: vscode.StatusBarItem;

	constructor() {
		this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		this.item.command = 'codekami.openDashboard';
		this.item.tooltip = 'Open CodeKami Dashboard';
		this.item.show();
	}

	update(profile: CodeKamiProfile): void {
		this.item.text = `⚔️ Lv.${profile.level} | 🔥 ${profile.streak} | ${profile.xp} XP`;
	}

	dispose(): void {
		this.item.dispose();
	}
}
