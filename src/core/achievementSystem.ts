import { CodeKamiProfile } from './types';
import { applyXp } from './levelSystem';
import { computeAllTimeSessionTotals } from './sessionHistory';
import type { StorageService } from '../storage/storageService';

export interface AchievementContext {
	hour?: number;
	totalCommits?: number;
	totalSuccessfulBuilds?: number;
	totalSuccessfulTests?: number;
	totalRecoveries?: number;
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
		id: 'apprentice-warrior',
		name: 'Apprentice Warrior',
		description: 'Reach Level 10.',
		icon: '🗡️',
		xpReward: 30,
		condition: (profile) => profile.level >= 10
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
		id: 'ship-it',
		name: 'Ship It',
		description: 'Reach 25 total successful builds.',
		icon: '🚀',
		xpReward: 60,
		condition: (_profile, context) => (context.totalSuccessfulBuilds ?? 0) >= 25
	},
	{
		id: 'test-pilot',
		name: 'Test Pilot',
		description: 'Reach 50 total successful test runs.',
		icon: '🎯',
		xpReward: 60,
		condition: (_profile, context) => (context.totalSuccessfulTests ?? 0) >= 50
	},
	{
		id: 'committed',
		name: 'Committed',
		description: 'Reach 50 total commits.',
		icon: '📜',
		xpReward: 60,
		condition: (_profile, context) => (context.totalCommits ?? 0) >= 50
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
		id: 'elite-warrior',
		name: 'Elite Warrior',
		description: 'Reach Level 50.',
		icon: '🛡️',
		xpReward: 75,
		condition: (profile) => profile.level >= 50
	},
	{
		id: 'centurion',
		name: 'Centurion',
		description: 'Maintain a 100 day streak.',
		icon: '💯',
		xpReward: 150,
		condition: (profile) => profile.streak >= 100
	},
	{
		id: 'grandmaster',
		name: 'Grandmaster',
		description: 'Reach Level 75.',
		icon: '🎖️',
		xpReward: 150,
		condition: (profile) => profile.level >= 75
	},
	{
		id: 'legendary-developer',
		name: 'Legendary Developer',
		description: 'Reach Level 100.',
		icon: '👑',
		xpReward: 200,
		condition: (profile) => profile.level >= 100
	},
	{
		id: 'unbreakable',
		name: 'Unbreakable',
		description: 'Maintain a 365 day streak.',
		icon: '🏔️',
		xpReward: 500,
		condition: (profile) => profile.streak >= 365
	},
	{
		id: 'redemption-arc',
		name: 'Redemption Arc',
		description: 'Recover from a failed build or test with an immediate success.',
		icon: '🔄',
		xpReward: 15,
		condition: (_profile, context) => (context.totalRecoveries ?? 0) >= 1
	},
	{
		id: 'bug-slayer',
		name: 'Bug Slayer',
		description: 'Reach 10 recoveries from failed builds or tests.',
		icon: '🐛',
		xpReward: 80,
		condition: (_profile, context) => (context.totalRecoveries ?? 0) >= 10
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
	extraContext: AchievementContext = {}
): Promise<CheckAchievementsResult> {
	const profile = storage.getProfile();
	const persisted = computeAllTimeSessionTotals(storage.getSessionHistory());

	// extraContext's totals are additive deltas (e.g. the in-progress session's
	// not-yet-persisted counts), not overrides, so callers can safely omit them.
	const context: AchievementContext = {
		hour: extraContext.hour,
		totalCommits: persisted.totalCommits + (extraContext.totalCommits ?? 0),
		totalSuccessfulBuilds: persisted.totalSuccessfulBuilds + (extraContext.totalSuccessfulBuilds ?? 0),
		totalSuccessfulTests: persisted.totalSuccessfulTests + (extraContext.totalSuccessfulTests ?? 0),
		totalRecoveries: persisted.totalRecoveries + (extraContext.totalRecoveries ?? 0)
	};

	const result = evaluateAchievements(profile, context);
	if (result.newlyUnlocked.length > 0) {
		await storage.saveProfile(result.profile);
	}
	return { newlyUnlocked: result.newlyUnlocked, leveledUpTo: result.leveledUpTo };
}
