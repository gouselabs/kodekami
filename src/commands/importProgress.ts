import * as vscode from 'vscode';
import type { StorageService } from '../storage/storageService';
import { isValidExportEnvelope } from '../core/exportFormat';

export async function importProgress(storage: StorageService): Promise<boolean> {
	const uris = await vscode.window.showOpenDialog({
		title: 'Import CodeKami Progress',
		filters: { JSON: ['json'] },
		canSelectMany: false
	});
	if (!uris || uris.length === 0) {
		return false;
	}

	let parsed: unknown;
	try {
		const bytes = await vscode.workspace.fs.readFile(uris[0]);
		parsed = JSON.parse(Buffer.from(bytes).toString('utf8'));
	} catch {
		void vscode.window.showErrorMessage('Could not read that file as CodeKami export JSON.');
		return false;
	}

	if (!isValidExportEnvelope(parsed)) {
		void vscode.window.showErrorMessage('That file is not a valid CodeKami export.');
		return false;
	}

	const confirmation = await vscode.window.showWarningMessage(
		'This will overwrite your current local CodeKami progress.',
		{
			modal: true,
			detail: `Importing from a backup exported ${new Date(parsed.exportedAt).toLocaleString()} (CodeKami v${parsed.extensionVersion}). This cannot be undone.`
		},
		'Import'
	);
	if (confirmation !== 'Import') {
		return false;
	}

	await storage.importAll(parsed);
	return true;
}
