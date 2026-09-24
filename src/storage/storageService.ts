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
import { FocusStateStorage, FOCUS_STATE_VERSION, createDefaultFocusState } from '../core/focusTypes';
import { QuestStateStorage, QUEST_STATE_VERSION, createDefaultQuestState } from '../core/questTypes';
import { syncQuestsForToday } from '../core/questProgress';
import { getLocalDateString } from '../core/streakSystem';
import { CodeKamiExportEnvelope, EXPORT_FORMAT_VERSION } from '../core/exportFormat';

const PROFILE_KEY = 'codekami.profile';
const SESSION_HISTORY_KEY = 'codekami.sessions';
const COMPANION_STATE_KEY = 'codekami.companionState';
const THEME_SELECTION_KEY = 'codekami.themeSelection';
const FOCUS_STATE_KEY = 'codekami.focusState';
const QUEST_STATE_KEY = 'codekami.questState';

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
		let migrated = history;

		if (!migrated.version || migrated.version < 2) {
			// v1 -> v2: introduced recovery tracking (a failed build/test immediately
			// followed by a successful one). Pre-v2 sessions predate the field, so
			// they backfill to 0 — there's no way to reconstruct it retroactively.
			migrated = {
				...migrated,
				sessions: migrated.sessions.map((session) => ({ ...session, recoveries: session.recoveries ?? 0 })),
				historicalAggregate: {
					...migrated.historicalAggregate,
					totalRecoveries: migrated.historicalAggregate.totalRecoveries ?? 0
				},
				version: 2
			};
		}

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

	getFocusState(): FocusStateStorage {
		const stored = this.context.globalState.get<FocusStateStorage>(FOCUS_STATE_KEY);
		if (!stored) {
			return createDefaultFocusState();
		}
		return this.migrateFocusState(stored);
	}

	async saveFocusState(state: FocusStateStorage): Promise<void> {
		await this.context.globalState.update(FOCUS_STATE_KEY, state);
	}

	async resetFocusState(): Promise<void> {
		await this.context.globalState.update(FOCUS_STATE_KEY, undefined);
	}

	private migrateFocusState(state: FocusStateStorage): FocusStateStorage {
		const migrated = state;

		// No migrations yet — this is the first version.

		return { ...createDefaultFocusState(), ...migrated, version: FOCUS_STATE_VERSION };
	}

	/**
	 * Unlike the other getters, this also rolls the selection forward to today
	 * if the stored state is from a previous day (or absent) — the same
	 * read-time self-healing `migrate()` does for schema versions, applied to
	 * "freshness" instead. A stale stored date is harmless: every read
	 * recomputes the correct value, and it's corrected in storage the next
	 * time a quest is completed.
	 */
	getQuestState(): QuestStateStorage {
		const stored = this.context.globalState.get<QuestStateStorage>(QUEST_STATE_KEY);
		const migrated = stored ? this.migrateQuestState(stored) : createDefaultQuestState();
		return syncQuestsForToday(migrated, getLocalDateString()).state;
	}

	async saveQuestState(state: QuestStateStorage): Promise<void> {
		await this.context.globalState.update(QUEST_STATE_KEY, state);
	}

	async resetQuestState(): Promise<void> {
		await this.context.globalState.update(QUEST_STATE_KEY, undefined);
	}

	private migrateQuestState(state: QuestStateStorage): QuestStateStorage {
		const migrated = state;

		// No migrations yet — this is the first version.

		return { ...createDefaultQuestState(), ...migrated, version: QUEST_STATE_VERSION };
	}

	exportAll(): CodeKamiExportEnvelope {
		return {
			exportVersion: EXPORT_FORMAT_VERSION,
			exportedAt: new Date().toISOString(),
			extensionVersion: String(this.context.extension.packageJSON.version ?? 'unknown'),
			data: {
				profile: this.getProfile(),
				sessionHistory: this.getSessionHistory(),
				companionState: this.getCompanionState(),
				themeSelection: this.getThemeSelection(),
				focusState: this.getFocusState(),
				questState: this.getQuestState()
			}
		};
	}

	/**
	 * Writes each domain through its own `saveX()` setter rather than touching
	 * globalState directly, so the next `getX()` call runs that domain's
	 * already-proven `migrate()` chain — an export from an older extension
	 * version stays importable with no import-specific migration code.
	 */
	async importAll(envelope: CodeKamiExportEnvelope): Promise<void> {
		await this.saveProfile(envelope.data.profile);
		await this.saveSessionHistory(envelope.data.sessionHistory);
		await this.saveCompanionState(envelope.data.companionState);
		await this.saveThemeSelection(envelope.data.themeSelection);
		await this.saveFocusState(envelope.data.focusState);
		await this.saveQuestState(envelope.data.questState);
	}
}
