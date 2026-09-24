import * as vscode from 'vscode';
import { codeKamiEvents, CodeKamiEvent } from '../events/codeKamiEvents';
import { deriveSoundEvent, bypassesSoundCooldown } from './deriveSoundEvent';
import { SOUND_FILES } from './AudioRegistry';
import { ReactionCooldown } from '../reactions/ReactionCooldown';
import { getSettings } from '../utils/settings';
import { log } from '../utils/logger';

const SOUNDS_DIR = 'sounds';
export const AUDIO_VIEW_ID = 'codekami.audioView';

interface PendingPlay {
	fileUri: vscode.Uri;
	volume: number;
}

interface WebviewMessage {
	command?: string;
	message?: string;
}

/**
 * Plays short sound effects via a persistent WebviewView in the Panel area
 * (alongside Terminal/Output), rather than a closeable editor tab. Unlike an
 * editor tab — which is fully destroyed when closed, requiring a fresh
 * browser-gesture unlock every time — a WebviewView survives normal
 * hide/show (switching panel tabs, collapsing the panel) and is only torn
 * down by a deliberate "right-click → uncheck", so the one-time click needed
 * to satisfy the browser's autoplay policy only has to happen once per VS
 * Code session, not once per sound.
 */
export class AudioService implements vscode.Disposable, vscode.WebviewViewProvider {
	private readonly cooldown = new ReactionCooldown();
	private readonly subscription: vscode.Disposable;
	private view: vscode.WebviewView | undefined;
	private viewReady = false;
	private audioUnlocked = false;
	private hasShownUnlockHint = false;
	private readonly pendingQueue: PendingPlay[] = [];
	private messageSubscription: vscode.Disposable | undefined;
	private disposeSubscription: vscode.Disposable | undefined;

	constructor(private readonly extensionUri: vscode.Uri) {
		this.subscription = codeKamiEvents.onEvent((event) => this.handleEvent(event));
	}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this.view = webviewView;
		this.viewReady = false;
		this.audioUnlocked = false;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, SOUNDS_DIR)]
		};
		webviewView.webview.html = this.render(webviewView.webview);

		this.messageSubscription?.dispose();
		this.messageSubscription = webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
			if (message?.command === 'ready') {
				this.viewReady = true;
				this.flushQueue();
			} else if (message?.command === 'unlocked') {
				this.audioUnlocked = true;
			} else if (message?.command === 'playError') {
				log(`Sound playback failed: ${message.message ?? 'unknown error'}`);
			}
		});

		this.disposeSubscription?.dispose();
		this.disposeSubscription = webviewView.onDidDispose(() => {
			this.view = undefined;
			this.viewReady = false;
			this.audioUnlocked = false;
			this.messageSubscription?.dispose();
			this.messageSubscription = undefined;
		});
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
				log(`Sound skipped (cooldown active): ${soundEvent}`);
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

		const volume = Math.max(0, Math.min(1, volumePercent / 100));
		this.enqueuePlay({ fileUri, volume });

		if (!this.audioUnlocked) {
			this.promptEnable();
		}
	}

	private promptEnable(): void {
		if (this.hasShownUnlockHint) {
			return;
		}
		this.hasShownUnlockHint = true;
		void vscode.window
			.showInformationMessage(
				'🔊 CodeKami wants to play a sound. Click the "CodeKami" panel (bottom panel, next to Terminal) once to allow it — a one-time browser requirement. It stays enabled for the rest of this VS Code session, even if you switch away from that panel.',
				'Show Panel'
			)
			.then((selection) => {
				if (selection === 'Show Panel') {
					void vscode.commands.executeCommand(`${AUDIO_VIEW_ID}.focus`);
				}
			});
	}

	private enqueuePlay(pending: PendingPlay): void {
		if (this.viewReady && this.view) {
			this.postPlay(this.view, pending);
			return;
		}
		// Either the view has never been shown yet (user hasn't opened the
		// CodeKami panel) or its script hasn't finished loading — queue it and
		// flush once the view exists and signals it's ready.
		this.pendingQueue.push(pending);
	}

	private flushQueue(): void {
		if (!this.view) {
			return;
		}
		while (this.pendingQueue.length > 0) {
			const pending = this.pendingQueue.shift();
			if (pending) {
				this.postPlay(this.view, pending);
			}
		}
	}

	private postPlay(view: vscode.WebviewView, pending: PendingPlay): void {
		const uri = view.webview.asWebviewUri(pending.fileUri).toString();
		void view.webview.postMessage({ command: 'play', uri, volume: pending.volume });
	}

	private render(webview: vscode.Webview): string {
		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src ${webview.cspSource}; script-src 'unsafe-inline'; style-src 'unsafe-inline';" />
	<style>
		body {
			background: transparent;
			color: var(--vscode-foreground);
			font-family: var(--vscode-font-family);
			font-size: 12px;
			padding: 12px;
			cursor: pointer;
			user-select: none;
		}
		#hint {
			padding: 10px;
			border: 1px dashed var(--vscode-widget-border, #555);
			border-radius: 6px;
			line-height: 1.5;
		}
	</style>
</head>
<body>
	<p id="hint">🔇 Click anywhere here once to enable CodeKami sound effects for this VS Code session.</p>
	<audio id="player"></audio>
	<script>
		const vscode = acquireVsCodeApi();
		const player = document.getElementById('player');
		const hint = document.getElementById('hint');
		let unlocked = false;
		let pending = null;

		function playNow(uri, volume) {
			player.src = uri;
			player.volume = volume;
			player.currentTime = 0;
			player.play().catch((error) => {
				vscode.postMessage({ command: 'playError', message: String(error) });
			});
		}

		function unlock() {
			if (unlocked) {
				return;
			}
			unlocked = true;
			hint.textContent = '🔊 Sound effects enabled for this session.';
			vscode.postMessage({ command: 'unlocked' });
			if (pending) {
				playNow(pending.uri, pending.volume);
				pending = null;
			}
		}

		document.body.addEventListener('click', unlock);

		window.addEventListener('message', (event) => {
			const { command, uri, volume } = event.data;
			if (command === 'play') {
				if (unlocked) {
					playNow(uri, volume);
				} else {
					pending = { uri, volume };
				}
			}
		});

		vscode.postMessage({ command: 'ready' });
	</script>
</body>
</html>`;
	}

	dispose(): void {
		this.subscription.dispose();
		this.messageSubscription?.dispose();
		this.disposeSubscription?.dispose();
	}
}
