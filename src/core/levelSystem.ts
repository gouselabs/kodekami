import { CodeKamiProfile } from './types';
import { LEVEL_CONFIG, LEVEL_TITLES } from './config';

export function xpRequiredForLevel(level: number): number {
	return Math.round(LEVEL_CONFIG.baseXp * Math.pow(level, LEVEL_CONFIG.growth));
}

export function getTitleForLevel(level: number): string {
	let title = LEVEL_TITLES[0].title;
	for (const entry of LEVEL_TITLES) {
		if (level >= entry.level) {
			title = entry.title;
		}
	}
	return title;
}

export interface ApplyXpResult {
	profile: CodeKamiProfile;
	leveledUpTo: number[];
}

export function applyXp(profile: CodeKamiProfile, amount: number): ApplyXpResult {
	let level = profile.level;
	let xp = profile.xp + amount;
	const leveledUpTo: number[] = [];

	while (xp >= xpRequiredForLevel(level)) {
		xp -= xpRequiredForLevel(level);
		level += 1;
		leveledUpTo.push(level);
	}

	return {
		profile: {
			...profile,
			level,
			xp,
			totalXp: profile.totalXp + amount
		},
		leveledUpTo
	};
}
