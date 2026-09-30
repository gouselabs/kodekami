/**
 * HEAD moves for a local commit, but also for a pull, merge, rebase, or
 * checkout — none of which are "the user made a commit". A real commit is
 * the one case that also clears out whatever was staged/dirty right before
 * it, so that combination is what actually distinguishes it.
 */
export function isLikelyCommit(params: { commitChanged: boolean; hadPendingChanges: boolean; nowHasPendingChanges: boolean }): boolean {
	return params.commitChanged && params.hadPendingChanges && !params.nowHasPendingChanges;
}
