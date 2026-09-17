import { CodeKamiProfile } from '../core/types';
import { getTitleForLevel } from '../core/levelSystem';
import { ACHIEVEMENTS } from '../core/achievementSystem';
import { findCharacterClassByName } from '../character/characterService';

export function generateCardText(profile: CodeKamiProfile): string {
	const title = getTitleForLevel(profile.level).toUpperCase();
	const name = (profile.cardName ?? 'Anonymous Coder').toUpperCase();
	const characterClass = findCharacterClassByName(profile.characterClass);
	const className = (profile.characterClass ?? 'Unclassed').toUpperCase();
	const weapon = characterClass?.weapon.toUpperCase() ?? 'BARE HANDS';
	const achievementCount = profile.achievements.length;

	const lines = [
		title,
		'',
		name,
		'',
		`LEVEL ${profile.level}`,
		'',
		'CLASS',
		className,
		'',
		'WEAPON',
		weapon,
		'',
		`🔥 ${profile.streak} DAY STREAK`,
		`🏆 ${achievementCount} / ${ACHIEVEMENTS.length} ACHIEVEMENTS`,
		`✨ ${profile.totalXp} TOTAL XP`,
		'',
		'CODEKAMI'
	];

	return lines.join('\n');
}
