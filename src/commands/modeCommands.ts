import * as vscode from 'vscode';

interface ModeSettings {
	enableNotifications: boolean;
	showReactions: boolean;
	enableSounds: boolean;
	showSessionSummary: boolean;
	showDailyMotivation: boolean;
	showCompanion: boolean;
}

// Quiet Mode silences interruptions (notifications, reactions, sounds, session
// summaries) for things like meetings or screen-sharing, but keeps the
// dashboard's personality touches. Work Mode goes further and also drops
// those flavor touches for a more minimal status bar — both only ever
// batch-update existing settings, so "Restore Normal Mode" can reset them to
// documented defaults without needing anywhere new to remember prior values.
const QUIET_MODE_SETTINGS: ModeSettings = {
	enableNotifications: false,
	showReactions: false,
	enableSounds: false,
	showSessionSummary: false,
	showDailyMotivation: true,
	showCompanion: true
};

const WORK_MODE_SETTINGS: ModeSettings = {
	enableNotifications: false,
	showReactions: false,
	enableSounds: false,
	showSessionSummary: false,
	showDailyMotivation: false,
	showCompanion: false
};

const NORMAL_MODE_SETTINGS: ModeSettings = {
	enableNotifications: true,
	showReactions: true,
	enableSounds: false,
	showSessionSummary: true,
	showDailyMotivation: true,
	showCompanion: true
};

async function applyModeSettings(settings: ModeSettings): Promise<void> {
	const config = vscode.workspace.getConfiguration('codekami');
	await Promise.all(
		(Object.keys(settings) as Array<keyof ModeSettings>).map((key) =>
			config.update(key, settings[key], vscode.ConfigurationTarget.Global)
		)
	);
}

export async function enableQuietMode(): Promise<void> {
	await applyModeSettings(QUIET_MODE_SETTINGS);
	void vscode.window.showInformationMessage(
		'🔇 Quiet Mode enabled — notifications, reactions, sounds, and session summaries are off. XP and progress still track normally.'
	);
}

export async function enableWorkMode(): Promise<void> {
	await applyModeSettings(WORK_MODE_SETTINGS);
	void vscode.window.showInformationMessage(
		'💼 Work Mode enabled — all interruptions are off, including the companion and daily motivation. XP and progress still track normally.'
	);
}

export async function restoreNormalMode(): Promise<void> {
	await applyModeSettings(NORMAL_MODE_SETTINGS);
	void vscode.window.showInformationMessage('🔔 CodeKami settings restored to their defaults.');
}
