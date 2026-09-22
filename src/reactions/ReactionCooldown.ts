import { isWithinCooldown } from '../core/cooldown';

export class ReactionCooldown {
	private lastShownAt: number | null = null;

	canShow(now: number, cooldownMs: number): boolean {
		if (this.lastShownAt === null) {
			return true;
		}
		return !isWithinCooldown(this.lastShownAt, now, cooldownMs);
	}

	markShown(now: number): void {
		this.lastShownAt = now;
	}
}
