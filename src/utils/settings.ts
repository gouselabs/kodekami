import * as vscode from 'vscode';

export type ReactionMode = 'notification' | 'statusBar' | 'both';

export interface CodeKamiSettings {
	enableNotifications: boolean;
	sessionStartXp: number;
	fileSaveXp: number;
	fileSaveCooldownMs: number;
	debugMode: boolean;
	showReactions: boolean;
	reactionMode: ReactionMode;
	reactionCooldownMs: number;
	sessionInactivityMs: number;
	showSessionSummary: boolean;
	showCompanion: boolean;
	enableSounds: boolean;
	soundVolume: number;
	soundCooldownMs: number;
	showDailyMotivation: boolean;
}

export function getSettings(): CodeKamiSettings {
	const config = vscode.workspace.getConfiguration('codekami');
	return {
		enableNotifications: config.get<boolean>('enableNotifications', true),
		sessionStartXp: config.get<number>('sessionStartXp', 5),
		fileSaveXp: config.get<number>('fileSaveXp', 2),
		fileSaveCooldownMs: config.get<number>('fileSaveCooldownSeconds', 60) * 1000,
		debugMode: config.get<boolean>('debugMode', false),
		showReactions: config.get<boolean>('showReactions', true),
		reactionMode: config.get<ReactionMode>('reactionMode', 'both'),
		reactionCooldownMs: config.get<number>('reactionCooldownSeconds', 45) * 1000,
		sessionInactivityMs: config.get<number>('sessionInactivityMinutes', 30) * 60_000,
		showSessionSummary: config.get<boolean>('showSessionSummary', true),
		showCompanion: config.get<boolean>('showCompanion', true),
		enableSounds: config.get<boolean>('enableSounds', false),
		soundVolume: config.get<number>('soundVolume', 70),
		soundCooldownMs: config.get<number>('reactionCooldownSeconds', 45) * 1000,
		showDailyMotivation: config.get<boolean>('showDailyMotivation', true)
	};
}
