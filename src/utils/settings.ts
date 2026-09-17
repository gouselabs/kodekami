import * as vscode from 'vscode';

export interface CodeKamiSettings {
	enableNotifications: boolean;
	sessionStartXp: number;
	fileSaveXp: number;
	fileSaveCooldownMs: number;
	debugMode: boolean;
}

export function getSettings(): CodeKamiSettings {
	const config = vscode.workspace.getConfiguration('codekami');
	return {
		enableNotifications: config.get<boolean>('enableNotifications', true),
		sessionStartXp: config.get<number>('sessionStartXp', 5),
		fileSaveXp: config.get<number>('fileSaveXp', 2),
		fileSaveCooldownMs: config.get<number>('fileSaveCooldownSeconds', 60) * 1000,
		debugMode: config.get<boolean>('debugMode', false)
	};
}
