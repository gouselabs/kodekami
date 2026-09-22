import * as vscode from 'vscode';
import { codeKamiEvents } from '../events/codeKamiEvents';
import { log } from '../utils/logger';
import type { SessionTrackerService } from './sessionTracker';

// The built-in git extension does not ship official @types/vscode declarations.
// This is a minimal, locally-defined surface covering only what's used here.
interface GitRepositoryState {
	readonly HEAD: { readonly commit?: string } | undefined;
	readonly onDidChange: vscode.Event<void>;
}
interface GitRepository {
	readonly state: GitRepositoryState;
}
interface GitApi {
	readonly repositories: GitRepository[];
	readonly onDidOpenRepository: vscode.Event<GitRepository>;
}
interface GitExtensionExports {
	getAPI(version: 1): GitApi;
}

const noopDisposable: vscode.Disposable = { dispose: () => undefined };

export function registerGitTracker(sessionTracker: SessionTrackerService): vscode.Disposable {
	try {
		const gitExtension = vscode.extensions.getExtension<GitExtensionExports>('vscode.git');
		if (!gitExtension) {
			log('git extension not found; commit tracking disabled');
			return noopDisposable;
		}

		const disposables: vscode.Disposable[] = [];
		const watchRepository = (repository: GitRepository) => {
			let lastCommit = repository.state.HEAD?.commit;
			disposables.push(
				repository.state.onDidChange(() => {
					const currentCommit = repository.state.HEAD?.commit;
					if (currentCommit && currentCommit !== lastCommit) {
						lastCommit = currentCommit;
						sessionTracker.recordCommit();
						codeKamiEvents.emit({ type: 'commit' });
					}
				})
			);
		};

		const attach = async () => {
			const extension = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
			const api = extension.getAPI(1);
			api.repositories.forEach(watchRepository);
			disposables.push(api.onDidOpenRepository(watchRepository));
		};

		void attach().catch((error) => {
			log(`git tracker unavailable: ${error instanceof Error ? error.message : String(error)}`);
		});

		return { dispose: () => disposables.forEach((d) => d.dispose()) };
	} catch (error) {
		log(`git tracker failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
		return noopDisposable;
	}
}
