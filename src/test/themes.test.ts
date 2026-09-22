import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME_ID, THEMES, findTheme, isThemeUnlocked } from '../themes/themes';
import { themeStyleBlock } from '../themes/themeCss';

describe('findTheme', () => {
	test('finds a known theme by id', () => {
		const theme = findTheme('void-realm');
		assert.ok(theme);
		assert.equal(theme.name, 'Void Realm');
	});

	test('returns undefined for an unknown id', () => {
		assert.equal(findTheme('does-not-exist'), undefined);
	});

	test('the default theme id resolves to a real theme unlocked at level 1', () => {
		const theme = findTheme(DEFAULT_THEME_ID);
		assert.ok(theme);
		assert.equal(theme.unlockLevel, 1);
	});
});

describe('isThemeUnlocked', () => {
	test('is unlocked when the level meets the requirement', () => {
		const theme = findTheme('samurai-dojo');
		assert.ok(theme);
		assert.equal(isThemeUnlocked(theme, 5), true);
		assert.equal(isThemeUnlocked(theme, 100), true);
	});

	test('is locked when the level is below the requirement', () => {
		const theme = findTheme('samurai-dojo');
		assert.ok(theme);
		assert.equal(isThemeUnlocked(theme, 4), false);
	});

	test('every theme unlock level is achievable (>= 1) and themes are ordered by increasing unlock level', () => {
		let previousLevel = 0;
		for (const theme of THEMES) {
			assert.ok(theme.unlockLevel >= 1);
			assert.ok(theme.unlockLevel >= previousLevel, `${theme.name} should not require a lower level than the previous theme`);
			previousLevel = theme.unlockLevel;
		}
	});
});

describe('themeStyleBlock', () => {
	test('emits a :root block containing every theme color as a CSS variable', () => {
		const theme = findTheme(DEFAULT_THEME_ID);
		assert.ok(theme);
		const css = themeStyleBlock(theme);

		assert.match(css, /:root\s*{/);
		assert.ok(css.includes(`--ck-background: ${theme.background};`));
		assert.ok(css.includes(`--ck-surface: ${theme.surface};`));
		assert.ok(css.includes(`--ck-primary: ${theme.primary};`));
		assert.ok(css.includes(`--ck-secondary: ${theme.secondary};`));
		assert.ok(css.includes(`--ck-text: ${theme.text};`));
		assert.ok(css.includes(`--ck-accent: ${theme.accent};`));
		assert.ok(css.includes(`--ck-border: ${theme.border};`));
	});
});
