export function isWithinCooldown(lastTimestamp: number, now: number, cooldownMs: number): boolean {
	return now - lastTimestamp < cooldownMs;
}
