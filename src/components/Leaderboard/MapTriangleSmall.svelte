<script>
	import MapTriangle from '../Common/MapTriangle.svelte';

	export let leaderboard;
</script>

{#if leaderboard}
	<span
		class="type"
		title="Pass: {leaderboard.passRating.toFixed(2)} Acc: {leaderboard.accRating.toFixed(2)} Tech: {leaderboard.techRating.toFixed(2)}"
		on:click>
		<span class="triangle">
			<MapTriangle mapRating={leaderboard} width="2.2em" height="2.2em" />
		</span>
	</span>
{/if}

<style>
	.type {
		padding: 0.4em;
		border-radius: 4px;
		height: 2.6em;
		background-color: black;
		display: flex;
	}
	.triangle {
		margin-top: -0.3em;
	}
</style>
