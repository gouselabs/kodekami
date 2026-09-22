import { CodeKamiTheme } from './themes';

export function themeStyleBlock(theme: CodeKamiTheme): string {
	return `:root {
			--ck-background: ${theme.background};
			--ck-surface: ${theme.surface};
			--ck-primary: ${theme.primary};
			--ck-secondary: ${theme.secondary};
			--ck-text: ${theme.text};
			--ck-accent: ${theme.accent};
			--ck-border: ${theme.border};
		}`;
}
