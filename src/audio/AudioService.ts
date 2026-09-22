import * as vscode from 'vscode';
import { codeKamiEvents, CodeKamiEvent } from '../events/codeKamiEvents';
import { deriveSoundEvent, bypassesSoundCooldown } from './deriveSoundEvent';
import { SOUND_FILES } from './AudioRegistry';
import { ReactionCooldown } from '../reactions/ReactionCooldown';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';

const SOUNDS_DIR = 'sounds';

export class AudioService implements vscode.Disposable {
	private readonly cooldown = new ReactionCooldown();
	private readonly subscription: vscode.Disposable;
	private panel: vscode.WebviewPanel | undefined;

	constructor(private readonly extensionUri: vscode.Uri) {
		this.subscription = codeKamiEvents.onEvent((event) => this.handleEvent(event));
	}

	private handleEvent(event: CodeKamiEvent): void {
		const settings = getSettings();
		if (!settings.enableSounds) {
			return;
		}

		const soundEvent = deriveSoundEvent(event);
		if (!soundEvent) {
			return;
		}

		if (!bypassesSoundCooldown(soundEvent)) {
			const now = Date.now();
			if (!this.cooldown.canShow(now, settings.soundCooldownMs)) {
				return;
			}
			this.cooldown.markShown(now);
		}

		void this.play(soundEvent, settings.soundVolume);
	}

	private async play(soundEvent: keyof typeof SOUND_FILES, volumePercent: number): Promise<void> {
		const fileName = SOUND_FILES[soundEvent];
		const fileUri = vscode.Uri.joinPath(this.extensionUri, SOUNDS_DIR, fileName);

		try {
			await vscode.workspace.fs.stat(fileUri);
		} catch {
			log(`Sound file missing, skipping: ${fileName}`);
			return;
		}

		const panel = this.ensurePanel();
		const webviewUri = panel.webview.asWebviewUri(fileUri).toString();
		const volume = Math.max(0, Math.min(1, volumePercent / 100));
		void panel.webview.postMessage({ command: 'play', uri: webviewUri, volume });
	}

	private ensurePanel(): vscode.WebviewPanel {
		if (this.panel) {
			return this.panel;
		}

		this.panel = vscode.window.createWebviewPanel(
			'codekamiAudio',
			'CodeKami Audio',
			{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, SOUNDS_DIR)]
			}
		);
		this.panel.webview.html = this.render(this.panel.webview);
		this.panel.onDidDispose(() => {
			this.panel = undefined;
		});

		return this.panel;
	}

	private render(webview: vscode.Webview): string {
		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src ${webview.cspSource}; script-src 'unsafe-inline';" />
	<style>
		body { background: transparent; color: var(--vscode-descriptionForeground); font-family: var(--vscode-font-family); padding: 16px; }
	</style>
</head>
<body>
	<p>CodeKami plays short sound effects here. You can leave this tab open in the background — closing it just pauses sound until the next event.</p>
	<audio id="player"></audio>
	<script>
		const player = document.getElementById('player');
		window.addEventListener('message', (event) => {
			const { command, uri, volume } = event.data;
			if (command === 'play') {
				player.src = uri;
				player.volume = volume;
				player.currentTime = 0;
				player.play().catch(() => {});
			}
		});
	</script>
</body>
</html>`;
	}

	dispose(): void {
		this.subscription.dispose();
		this.panel?.dispose();
	}
}
