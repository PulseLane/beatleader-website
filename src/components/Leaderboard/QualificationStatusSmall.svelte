<script>
	import {dateFromUnix, formatDateRelative, getTimeStringColor, WEEKSECONDS} from '../../utils/date';
	import createPlayerService from '../../services/beatleader/player';
	import PlayerNameWithFlag from '../Common/PlayerNameWithFlag.svelte';
	import Avatar from '../Common/Avatar.svelte';

	export let qualification;

	function navigateToPlayer(playerId) {
		if (!playerId) return;

		navigate(`/u/${playerId}`);
	}

	let nominator;

	async function retrieveNominator(qualification) {
		if (!qualification || qualification.approved) return;

		const playerService = createPlayerService();
		nominator = await playerService.fetchPlayerOrGetFromCache(qualification.rtMember);
	}

	$: retrieveNominator(qualification);
</script>

{#if qualification}
	<div class="qualification-description">
		{#if qualification.qualityVote > 0}
			<span style="color: green;"><i class="fa fa-check" /> Quality</span>
		{:else if qualification.qualityVote < 0}
			<span style="color: red;"><i class="fa fa-xmark" /> Quality</span>
		{:else}
			<span style="color: gray;"><i class="fa fa-question" /> Quality</span>
		{/if}

		{#if qualification.criteriaMet == 1}
			<span style="color: green;"><i class="fa fa-check" /> Criteria</span>
		{:else if qualification.criteriaMet == 2}
			<span style="color: red;"><i class="fa fa-xmark" /> Criteria</span>
		{:else if qualification?.criteriaMet == 3}
			<span style="color: yellow;"><i class="fa fa-circle-pause" /> Criteria</span>
		{:else}
			<span style="color: gray;"><i class="fa fa-xmark" /> Criteria</span>
		{/if}

		{#if qualification.approvers}
			{#if qualification.approved}
				<span style="color: green;"><i class="fa fa-check" /> RT</span>

				<div class="timeset">
					{#if Date.now() / 1000 - qualification.approvalTimeset < WEEKSECONDS}
						<span>
							Ready to rank {formatDateRelative(dateFromUnix(qualification.approvalTimeset + WEEKSECONDS))}
						</span>
					{:else}
						<span style="color: green;"><i class="fa fa-check" /> Ready to rank</span>
					{/if}
				</div>
			{:else}
				<span style="color: red;"><i class="fa fa-xmark" /> RT</span>
			{/if}
		{:else}
			<span style="color: gray;"><i class="fa fa-xmark" /> RT</span>
		{/if}
	</div>
{/if}

<style>
	.qualification-description {
		display: flex;
		grid-gap: 0.8em;
		align-items: center;
		flex-wrap: wrap;
	}

	.timeset {
		display: flex;
		grid-gap: 0.4em;
	}
</style>
