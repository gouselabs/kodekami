import type { CodeKamiProfile } from './types';
import type { SessionHistoryStorage } from './sessionTypes';
import type { CompanionStateStorage } from './companionTypes';
import type { ThemeSelectionStorage } from './themeTypes';
import type { FocusStateStorage } from './focusTypes';
import type { QuestStateStorage } from './questTypes';

export const EXPORT_FORMAT_VERSION = 1;

export interface CodeKamiExportData {
	profile: CodeKamiProfile;
	sessionHistory: SessionHistoryStorage;
	companionState: CompanionStateStorage;
	themeSelection: ThemeSelectionStorage;
	focusState: FocusStateStorage;
	questState: QuestStateStorage;
}

export interface CodeKamiExportEnvelope {
	exportVersion: number;
	exportedAt: string;
	extensionVersion: string;
	data: CodeKamiExportData;
}

/**
 * Structural check only — this just confirms the file looks like a CodeKami
 * export. Each domain's real validation happens when it's written through the
 * existing `saveX()` setters on import, which run the same `migrate()` chain
 * a naturally-persisted old value would — an export from an older version
 * stays importable forever with no export-specific migration code.
 */
export function isValidExportEnvelope(value: unknown): value is CodeKamiExportEnvelope {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const envelope = value as Partial<CodeKamiExportEnvelope>;
	return (
		typeof envelope.exportVersion === 'number' &&
		typeof envelope.exportedAt === 'string' &&
		typeof envelope.extensionVersion === 'string' &&
		!!envelope.data &&
		typeof envelope.data === 'object'
	);
}
