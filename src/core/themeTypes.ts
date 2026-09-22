import { DEFAULT_THEME_ID } from '../themes/themes';

export interface ThemeSelectionStorage {
	version: number;
	selectedThemeId: string;
}

export const THEME_SELECTION_VERSION = 1;

export function createDefaultThemeSelection(): ThemeSelectionStorage {
	return {
		version: THEME_SELECTION_VERSION,
		selectedThemeId: DEFAULT_THEME_ID
	};
}
