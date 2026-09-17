import * as vscode from 'vscode';
import { StorageService } from '../storage/storageService';
import { generateCardText } from '../cards/developerCardService';
import { DeveloperCardProvider } from '../webview/developerCardProvider';

export async function generateDeveloperCard(storage: StorageService, cardProvider: DeveloperCardProvider): Promise<void> {
	let profile = storage.getProfile();

	if (!profile.cardName) {
		const input = await vscode.window.showInputBox({
			title: 'CodeKami Developer Card',
			prompt: 'Enter a display name for your card (optional)',
			placeHolder: 'e.g. KAI'
		});
		const cardName = input?.trim() || 'Anonymous Coder';
		await storage.saveProfile({ ...profile, cardName });
		profile = storage.getProfile();
	}

	await vscode.env.clipboard.writeText(generateCardText(profile));
	cardProvider.show(profile);
	void vscode.window.showInformationMessage('Developer Card copied to clipboard!');
}
