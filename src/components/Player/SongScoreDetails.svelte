<script>
	import {LEADERBOARD_SCORES_PER_PAGE} from '../../utils/beatleader/consts';
	import {LEADERBOARD_SCORES_PER_PAGE as ACCSABER_LEADERBOARD_SCORES_PER_PAGE} from '../../utils/accsaber/consts';
	import scoreStatisticEnhancer from '../../stores/http/enhancers/scores/scoreStatistic';
	import BeatSaviorDetails from '../BeatSavior/Details.svelte';
	import LeaderboardPage from '../../pages/Leaderboard.svelte';
	import LeaderboardStats from '../Leaderboard/LeaderboardStats.svelte';
	import Spinner from '../Common/Spinner.svelte';
	import ReplayDetails from '../Score/ReplayDetails.svelte';

	export let playerId;
	export let songScore;
	export let fixedBrowserTitle = null;
	export let noSsLeaderboard = false;
	export let showAccSaberLeaderboard = false;
	export let replayAccGraphs;

	function handleReplayWasProcessed(e) {
		replayAccGraphs = e.detail.accGraphsData;
	}

	let inBuiltLeaderboardPage = null;

	function updateInBuiltLeaderboardPage(rank, scoresPerPage) {
		if (!rank) {
			inBuiltLeaderboardPage = null;
			return;
		}

		inBuiltLeaderboardPage = Math.floor((rank - 1) / scoresPerPage) + 1;
	}

	$: leaderboard = songScore?.leaderboard ?? null;
	$: score = songScore?.score ?? null;
	$: beatSaviorPromise = scoreStatisticEnhancer(songScore);

	$: updateInBuiltLeaderboardPage(
		score && score.rank ? score.rank : null,
		showAccSaberLeaderboard ? ACCSABER_LEADERBOARD_SCORES_PER_PAGE : LEADERBOARD_SCORES_PER_PAGE
	);
</script>

<section class="details">
	{#if songScore}
		<div class="tab">
			<LeaderboardStats {leaderboard} />
		</div>

		{#await beatSaviorPromise}
			<div class="tab">
				<Spinner />
			</div>
		{:then beatSavior}
			<div class="tab">
				<BeatSaviorDetails {beatSavior} showGrid={score?.replay == null} {replayAccGraphs} />
			</div>
		{/await}

		{#if score?.replay}
			<div class="tab">
				<ReplayDetails {score} on:replay-was-processed={handleReplayWasProcessed} />
			</div>
		{/if}

		{#if showAccSaberLeaderboard}
			<div class="tab">
				<LeaderboardPage
					leaderboardId={leaderboard.leaderboardId}
					type="accsaber"
					page={inBuiltLeaderboardPage}
					autoScrollToTop={false}
					showStats={false}
					dontNavigate={true}
					withoutDiffSwitcher={true}
					withoutHeader={true}
					{fixedBrowserTitle}
					higlightedScore={score} />
			</div>
		{:else if !noSsLeaderboard}
			<div class="tab">
				<LeaderboardPage
					leaderboardId={leaderboard.leaderboardId}
					type="global"
					page={inBuiltLeaderboardPage}
					autoScrollToTop={false}
					showStats={false}
					dontNavigate={true}
					withoutDiffSwitcher={true}
					withoutHeader={true}
					{fixedBrowserTitle}
					higlightedScore={score} />
			</div>
		{/if}
	{/if}
</section>

<style>
	.details {
		display: flex;
		flex-direction: column;
		grid-row-gap: 0.2em;
		padding-top: 0.4em;
	}

	.tab {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.tab > :global(*) {
		grid-area: 1 / 1 / 1 / 1;
	}
</style>
