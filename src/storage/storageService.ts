import type * as vscode from 'vscode';
import { CodeKamiProfile, PROFILE_VERSION, createDefaultProfile } from '../core/types';

const PROFILE_KEY = 'codekami.profile';

export class StorageService {
	constructor(private readonly context: vscode.ExtensionContext) {}

	getProfile(): CodeKamiProfile {
		const stored = this.context.globalState.get<CodeKamiProfile>(PROFILE_KEY);
		if (!stored) {
			return createDefaultProfile();
		}
		return this.migrate(stored);
	}

	async saveProfile(profile: CodeKamiProfile): Promise<void> {
		await this.context.globalState.update(PROFILE_KEY, profile);
	}

	async resetProfile(): Promise<void> {
		await this.context.globalState.update(PROFILE_KEY, undefined);
	}

	private migrate(profile: CodeKamiProfile): CodeKamiProfile {
		let migrated = profile;

		if (!migrated.version || migrated.version < 2) {
			// v1 -> v2: introduced the achievements list.
			migrated = { ...migrated, achievements: migrated.achievements ?? [], version: 2 };
		}

		if (migrated.version < 3) {
			// v2 -> v3: introduced the Developer Card display name.
			migrated = { ...migrated, cardName: migrated.cardName ?? null, version: 3 };
		}

		return { ...createDefaultProfile(), ...migrated, version: PROFILE_VERSION };
	}
}
