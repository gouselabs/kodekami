import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { getLocalDateString } from '../core/streakSystem';

export async function exportProgress(storage: StorageService): Promise<void> {
	const envelope = storage.exportAll();
	const defaultName = `codekami-backup-${getLocalDateString()}.json`;

	const uri = await vscode.window.showSaveDialog({
		title: 'Export CodeKami Progress',
		filters: { JSON: ['json'] },
		defaultUri: vscode.Uri.file(defaultName)
	});
	if (!uri) {
		return;
	}

	await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(envelope, null, 2), 'utf8'));
	void vscode.window.showInformationMessage(`CodeKami progress exported to ${uri.fsPath}.`);
}
