import type * as vscode from 'vscode';
import { CodeKamiProfile, PROFILE_VERSION, createDefaultProfile } from '../core/types';
import {
	SessionHistoryStorage,
	SESSION_HISTORY_VERSION,
	createDefaultSessionHistory,
	CodingSession
} from '../core/sessionTypes';
import { appendSession } from '../core/sessionHistory';
import { CompanionStateStorage, COMPANION_STATE_VERSION, createDefaultCompanionState } from '../core/companionTypes';
import { ThemeSelectionStorage, THEME_SELECTION_VERSION, createDefaultThemeSelection } from '../core/themeTypes';

const PROFILE_KEY = 'codekami.profile';
const SESSION_HISTORY_KEY = 'codekami.sessions';
const COMPANION_STATE_KEY = 'codekami.companionState';
const THEME_SELECTION_KEY = 'codekami.themeSelection';

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

	getSessionHistory(): SessionHistoryStorage {
		const stored = this.context.globalState.get<SessionHistoryStorage>(SESSION_HISTORY_KEY);
		if (!stored) {
			return createDefaultSessionHistory();
		}
		return this.migrateSessionHistory(stored);
	}

	async saveSessionHistory(history: SessionHistoryStorage): Promise<void> {
		await this.context.globalState.update(SESSION_HISTORY_KEY, history);
	}

	async appendSession(session: CodingSession): Promise<void> {
		const updated = appendSession(this.getSessionHistory(), session);
		await this.saveSessionHistory(updated);
	}

	async resetSessionHistory(): Promise<void> {
		await this.context.globalState.update(SESSION_HISTORY_KEY, undefined);
	}

	private migrateSessionHistory(history: SessionHistoryStorage): SessionHistoryStorage {
		const migrated = history;

		// No migrations yet — this is the first version. Future schema changes
		// follow the same `if (migrated.version < N)` pattern as migrate() above.

		return { ...createDefaultSessionHistory(), ...migrated, version: SESSION_HISTORY_VERSION };
	}

	getCompanionState(): CompanionStateStorage {
		const stored = this.context.globalState.get<CompanionStateStorage>(COMPANION_STATE_KEY);
		if (!stored) {
			return createDefaultCompanionState();
		}
		return this.migrateCompanionState(stored);
	}

	async saveCompanionState(state: CompanionStateStorage): Promise<void> {
		await this.context.globalState.update(COMPANION_STATE_KEY, state);
	}

	async resetCompanionState(): Promise<void> {
		await this.context.globalState.update(COMPANION_STATE_KEY, undefined);
	}

	private migrateCompanionState(state: CompanionStateStorage): CompanionStateStorage {
		const migrated = state;

		// No migrations yet — this is the first version.

		return { ...createDefaultCompanionState(), ...migrated, version: COMPANION_STATE_VERSION };
	}

	getThemeSelection(): ThemeSelectionStorage {
		const stored = this.context.globalState.get<ThemeSelectionStorage>(THEME_SELECTION_KEY);
		if (!stored) {
			return createDefaultThemeSelection();
		}
		return this.migrateThemeSelection(stored);
	}

	async saveThemeSelection(selection: ThemeSelectionStorage): Promise<void> {
		await this.context.globalState.update(THEME_SELECTION_KEY, selection);
	}

	async resetThemeSelection(): Promise<void> {
		await this.context.globalState.update(THEME_SELECTION_KEY, undefined);
	}

	private migrateThemeSelection(selection: ThemeSelectionStorage): ThemeSelectionStorage {
		const migrated = selection;

		// No migrations yet — this is the first version.

		return { ...createDefaultThemeSelection(), ...migrated, version: THEME_SELECTION_VERSION };
	}
}
