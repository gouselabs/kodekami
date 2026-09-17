import { CodeKamiProfile } from './types';
import { applyXp } from './levelSystem';
import type { StorageService } from '../storage/storageService';

export interface AchievementContext {
	hour?: number;
}

export interface AchievementDefinition {
	id: string;
	name: string;
	description: string;
	icon: string;
	xpReward: number;
	condition: (profile: CodeKamiProfile, context: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: ReadonlyArray<AchievementDefinition> = [
	{
		id: 'first-blood',
		name: 'First Blood',
		description: 'Start your first CodeKami session.',
		icon: '🩸',
		xpReward: 10,
		condition: () => true
	},
	{
		id: 'night-owl',
		name: 'Night Owl',
		description: 'Save a file between midnight and 4 AM.',
		icon: '🌙',
		xpReward: 20,
		condition: (_profile, context) => context.hour !== undefined && context.hour >= 0 && context.hour < 4
	},
	{
		id: 'code-warrior',
		name: 'Code Warrior',
		description: 'Reach Level 25.',
		icon: '⚔️',
		xpReward: 50,
		condition: (profile) => profile.level >= 25
	},
	{
		id: 'no-surrender',
		name: 'No Surrender',
		description: 'Maintain a 30 day streak.',
		icon: '🔥',
		xpReward: 100,
		condition: (profile) => profile.streak >= 30
	},
	{
		id: 'legendary-developer',
		name: 'Legendary Developer',
		description: 'Reach Level 100.',
		icon: '👑',
		xpReward: 200,
		condition: (profile) => profile.level >= 100
	}
];

export function isUnlocked(profile: CodeKamiProfile, id: string): boolean {
	return profile.achievements.some((a) => a.id === id);
}

export interface EvaluateAchievementsResult {
	profile: CodeKamiProfile;
	newlyUnlocked: AchievementDefinition[];
	leveledUpTo: number[];
}

export function evaluateAchievements(
	profile: CodeKamiProfile,
	context: AchievementContext = {}
): EvaluateAchievementsResult {
	let working = profile;
	const newlyUnlocked: AchievementDefinition[] = [];
	const leveledUpTo: number[] = [];

	for (const definition of ACHIEVEMENTS) {
		if (isUnlocked(working, definition.id)) {
			continue;
		}
		if (!definition.condition(working, context)) {
			continue;
		}

		working = {
			...working,
			achievements: [...working.achievements, { id: definition.id, unlockedAt: new Date().toISOString() }]
		};

		const applied = applyXp(working, definition.xpReward);
		working = applied.profile;
		leveledUpTo.push(...applied.leveledUpTo);
		newlyUnlocked.push(definition);
	}

	return { profile: working, newlyUnlocked, leveledUpTo };
}

export interface CheckAchievementsResult {
	newlyUnlocked: AchievementDefinition[];
	leveledUpTo: number[];
}

export async function checkAchievements(
	storage: StorageService,
	context: AchievementContext = {}
): Promise<CheckAchievementsResult> {
	const profile = storage.getProfile();
	const result = evaluateAchievements(profile, context);
	if (result.newlyUnlocked.length > 0) {
		await storage.saveProfile(result.profile);
	}
	return { newlyUnlocked: result.newlyUnlocked, leveledUpTo: result.leveledUpTo };
}
