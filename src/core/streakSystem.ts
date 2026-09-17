import { CodeKamiProfile } from './types';
import { STREAK_MILESTONES } from './config';
import type { StorageService } from '../storage/storageService';

export function getLocalDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string): Date {
	const [year, month, day] = dateString.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function daysBetween(fromDateString: string, toDateString: string): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	const diff = parseLocalDate(toDateString).getTime() - parseLocalDate(fromDateString).getTime();
	return Math.round(diff / msPerDay);
}

export interface ApplyStreakResult {
	profile: CodeKamiProfile;
	incremented: boolean;
	milestone?: number;
}

export function applyDailyStreak(profile: CodeKamiProfile, today: string): ApplyStreakResult {
	if (profile.lastActiveDate === today) {
		return { profile, incremented: false };
	}

	const gap = profile.lastActiveDate ? daysBetween(profile.lastActiveDate, today) : null;
	const streak = gap === 1 ? profile.streak + 1 : 1;
	const longestStreak = Math.max(profile.longestStreak, streak);

	return {
		profile: { ...profile, streak, longestStreak, lastActiveDate: today },
		incremented: true,
		milestone: STREAK_MILESTONES.includes(streak) ? streak : undefined
	};
}

export async function recordDailyActivity(storage: StorageService): Promise<ApplyStreakResult> {
	const profile = storage.getProfile();
	const result = applyDailyStreak(profile, getLocalDateString());
	if (result.incremented) {
		await storage.saveProfile(result.profile);
	}
	return result;
}
