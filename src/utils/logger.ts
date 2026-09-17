import * as vscode from 'vscode';
import { getSettings } from './settings';

let channel: vscode.OutputChannel | undefined;

export function log(message: string): void {
	if (!getSettings().debugMode) {
		return;
	}
	if (!channel) {
		channel = vscode.window.createOutputChannel('CodeKami');
	}
	channel.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
}
