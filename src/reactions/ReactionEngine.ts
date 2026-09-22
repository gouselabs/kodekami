import { AnimeReaction, REACTIONS, ReactionEventType } from './reactions';

export function pickReaction(
	event: ReactionEventType,
	random: () => number = Math.random
): AnimeReaction | undefined {
	const candidates = REACTIONS.filter((reaction) => reaction.event === event);
	if (candidates.length === 0) {
		return undefined;
	}
	const index = Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
	return candidates[index];
}
