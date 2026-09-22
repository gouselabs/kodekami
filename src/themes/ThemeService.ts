import type { StorageService } from '../storage/storageService';
import { CodeKamiTheme, DEFAULT_THEME_ID, findTheme, isThemeUnlocked } from './themes';

export function getCurrentTheme(storage: StorageService): CodeKamiTheme {
	const defaultTheme = findTheme(DEFAULT_THEME_ID);
	if (!defaultTheme) {
		throw new Error('Default CodeKami theme is missing from the theme registry.');
	}

	const { selectedThemeId } = storage.getThemeSelection();
	const theme = findTheme(selectedThemeId);
	if (!theme) {
		return defaultTheme;
	}

	const level = storage.getProfile().level;
	return isThemeUnlocked(theme, level) ? theme : defaultTheme;
}
