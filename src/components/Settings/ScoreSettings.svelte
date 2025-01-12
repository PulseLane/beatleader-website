<script>
	import {configStore, DEFAULT_LOCALE, getSupportedLocales} from '../../stores/config';
	import Switch from '../Common/Switch.svelte';
	import DemoScores from './DemoScores.svelte';
	import Select from './Select.svelte';
	import createAccountStore from '../../stores/beatleader/account';
	import {fly, fade} from 'svelte/transition';

	export let animationSign = 1;

	const DEFAULT_PP_METRIC = 'weighted';
	const DEFAULT_SCORE_COMPARISON_METHOD = 'in-place';
	const DEFAULT_ONECLICK_VALUE = 'modassistant';

	const scoreComparisonMethods = [
		{name: 'In place', value: DEFAULT_SCORE_COMPARISON_METHOD},
		{name: 'In details', value: 'in-details'},
	];

	const ppMetrics = [
		{name: 'Weighted PP', value: DEFAULT_PP_METRIC},
		{name: 'PP improvement', value: 'improvement'},
		{name: 'Total PP gain', value: 'total-gain'},
		{name: 'PP on full combo', value: 'full-combo'},
	];

	const oneclickOptions = [
		{name: 'Mod Assistant', value: DEFAULT_ONECLICK_VALUE},
		{name: 'Playlist sync', value: 'playlist'},
	];

	let currentLocale = DEFAULT_LOCALE;
	let currentPpMetric = DEFAULT_PP_METRIC;
	let currentScoreComparisonMethod = DEFAULT_SCORE_COMPARISON_METHOD;
	let currentOneclick = DEFAULT_ONECLICK_VALUE;

	function onConfigUpdated(config) {
		if (config?.locale != currentLocale) currentLocale = config.locale;
		if (config?.preferences?.ppMetric != currentPpMetric) currentPpMetric = config?.preferences?.ppMetric ?? DEFAULT_PP_METRIC;
		if (config?.scoreComparison != currentScoreComparisonMethod)
			currentScoreComparisonMethod = config?.scoreComparison?.method ?? DEFAULT_SCORE_COMPARISON_METHOD;
		if (config?.preferences?.oneclick != currentOneclick) currentOneclick = config?.preferences?.oneclick ?? DEFAULT_ONECLICK_VALUE;
	}

	async function settempsetting(key, subkey, value) {
		if (subkey) {
			var preferences = configStore.get(key);
			preferences[subkey] = value;
			await configStore.setForKey(key, preferences, false);
		} else {
			await configStore.setForKey(key, value, false);
		}
	}

	function preferencesKeyDescription(key) {
		switch (key) {
			case 'showReplayCounter':
				return 'Show watch counter';

			default:
				break;
		}
		return key;
	}

	const account = createAccountStore();

	$: onConfigUpdated(configStore && $configStore ? $configStore : null);

	$: settempsetting('locale', null, currentLocale);
	$: settempsetting('preferences', 'ppMetric', currentPpMetric);
	$: settempsetting('scoreComparison', 'method', currentScoreComparisonMethod);
	$: settempsetting('preferences', 'oneclick', currentOneclick);

	$: scorePreferences = $configStore.scorePreferences;
	$: visibleScoreIcons = $configStore.visibleScoreIcons;

	$: preferencesList = Object.keys(scorePreferences);
	$: scoreIcons = Object.keys(visibleScoreIcons).filter(key => key != 'delete');
</script>

<div class="main-container" in:fly={{y: animationSign * 200, duration: 400}} out:fade={{duration: 100}}>
	<DemoScores playerId={$account?.player?.playerId ?? '76561199104169308'} />

	<div class="switches-container">
		<span>Score settings:</span>
		<div class="switches">
			{#each preferencesList as key}
				<Switch
					value={scorePreferences[key]}
					label={preferencesKeyDescription(key)}
					fontSize={12}
					design="slider"
					on:click={() => settempsetting('scorePreferences', key, !scorePreferences[key])} />
			{/each}
		</div>
	</div>

	<div class="switches-container">
		<span>Buttons to show:</span>
		<div class="switches">
			{#each scoreIcons as key}
				<Switch
					value={visibleScoreIcons[key]}
					label={key}
					fontSize={12}
					design="slider"
					on:click={() => settempsetting('visibleScoreIcons', key, !visibleScoreIcons[key])} />
			{/each}
		</div>
	</div>

	<div class="options">
		<section class="option">
			<label
				title="Determines which metric will be displayed at the score under PP, if available. The others will be displayed in the tooltip."
				>PP metric</label>
			<Select bind:value={currentPpMetric}>
				{#each ppMetrics as option (option.value)}
					<option value={option.value}>{option.name}</option>
				{/each}
			</Select>
		</section>

		<section class="option">
			<label
				title="Comparison of a current player's score against the main player will be displayed either immediately or after expanding the details"
				>Score comparison</label>
			<Select bind:value={currentScoreComparisonMethod}>
				{#each scoreComparisonMethods as option (option.value)}
					<option value={option.value}>{option.name}</option>
				{/each}
			</Select>
		</section>

		<section class="option">
			<label title="All numbers and dates will be formatted according to the rules of the selected locale">Locale</label>
			<Select bind:value={currentLocale}>
				{#each getSupportedLocales() as option (option.id)}
					<option value={option.id}>{option.name}</option>
				{/each}
			</Select>
		</section>

		<section class="option">
			<label title="How One-Click button will work">One-click installs</label>
			<Select bind:value={currentOneclick}>
				{#each oneclickOptions as option (option.value)}
					<option value={option.value}>{option.name}</option>
				{/each}
			</Select>
		</section>
	</div>
</div>

<style>
	.main-container {
		display: flex;
		flex-direction: column;
	}
	.options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 1em;
		align-items: start;
		justify-items: start;
	}
	.option {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	label {
		display: block;
		font-size: 0.75em;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #afafaf !important;
		margin-bottom: 0.25em;
	}

	.switches {
		display: flex;
		grid-gap: 1em;
		flex-wrap: wrap;
		justify-content: space-evenly;
		padding: 0.5em;
	}

	@media screen and (max-width: 600px) {
		.options {
			grid-template-columns: 1fr;
		}
	}
</style>
