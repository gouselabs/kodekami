export interface CodeKamiTheme {
	id: string;
	name: string;
	background: string;
	surface: string;
	primary: string;
	secondary: string;
	text: string;
	accent: string;
	border: string;
	unlockLevel: number;
}

// Unlock levels intentionally line up with the existing level titles
// (Warrior=25, Elite Warrior=50, Master=75) for narrative continuity.
export const THEMES: ReadonlyArray<CodeKamiTheme> = [
	{
		id: 'default-cyber',
		name: 'Default Cyber',
		unlockLevel: 1,
		background: '#11131a',
		surface: '#1a1d29',
		primary: '#7dd3fc',
		secondary: '#ff6fae',
		text: '#e6e6f0',
		accent: '#7dd3fc',
		border: '#333a4d'
	},
	{
		id: 'samurai-dojo',
		name: 'Samurai Dojo',
		unlockLevel: 5,
		background: '#1a1210',
		surface: '#241a16',
		primary: '#e63946',
		secondary: '#f4a261',
		text: '#f1e9e0',
		accent: '#e63946',
		border: '#3a2a24'
	},
	{
		id: 'void-realm',
		name: 'Void Realm',
		unlockLevel: 10,
		background: '#0a0a12',
		surface: '#14141f',
		primary: '#9d4edd',
		secondary: '#5a189a',
		text: '#e0d9f0',
		accent: '#9d4edd',
		border: '#2a2440'
	},
	{
		id: 'demon-realm',
		name: 'Demon Realm',
		unlockLevel: 25,
		background: '#1a0a0a',
		surface: '#2a1010',
		primary: '#ff3131',
		secondary: '#8b0000',
		text: '#f0dede',
		accent: '#ff3131',
		border: '#3a1818'
	},
	{
		id: 'neon-city',
		name: 'Neon City',
		unlockLevel: 50,
		background: '#0d0d1a',
		surface: '#16162a',
		primary: '#00f5ff',
		secondary: '#ff00ff',
		text: '#e0f7ff',
		accent: '#00f5ff',
		border: '#252540'
	},
	{
		id: 'spirit-forest',
		name: 'Spirit Forest',
		unlockLevel: 75,
		background: '#0d1410',
		surface: '#16211a',
		primary: '#4ade80',
		secondary: '#facc15',
		text: '#e0f0e5',
		accent: '#4ade80',
		border: '#243026'
	}
];

export const DEFAULT_THEME_ID = THEMES[0].id;

export function findTheme(id: string): CodeKamiTheme | undefined {
	return THEMES.find((theme) => theme.id === id);
}

export function isThemeUnlocked(theme: CodeKamiTheme, level: number): boolean {
	return level >= theme.unlockLevel;
}
