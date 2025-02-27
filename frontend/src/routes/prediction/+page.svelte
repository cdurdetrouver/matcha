<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	const toastStore = getToastStore();

	let display_mode = 0;

	let idanimal: string;
	let prediction: {
		libeco2: string;
		libeco3: string;
		naissance: string;
		poids: string;
		prix: string;
	} = { libeco2: 'None', libeco3: 'None', naissance: 'None', poids: 'None', prix: 'None' };

	let start_time: number;

	async function request(idanimal: string) {
		try {
			const response = await fetch('http://localhost:5000/prediction_id', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: idanimal })
			});

			if (!response.ok) {
				const errorData = await response.json();
				const t = {
					message: 'Erreur: ' + errorData.error,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				setTimeout(
					() => {
						display_mode = 0;
					},
					Math.max(0, start_time + 1000 - Date.now())
				);
				return null;
			}

			const data = await response.json();
			prediction = {
				libeco2: data['p_libeco2'],
				libeco3: data['p_libeco3'],
				naissance: data['p_ponais'],
				poids: data['p_p210'],
				prix: data['p_enchere']
			};
			return prediction;
		} catch (error) {
			const t: ToastSettings = {
				message: 'Erreur: ' + (error as Error).message,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			setTimeout(
				() => {
					display_mode = 0;
				},
				Math.max(0, start_time + 1000 - Date.now())
			);
			return null;
		}
	}

	function make_prediction(event: Event) {
		if (!/^\d{6}$/.test(idanimal)) {
			const t: ToastSettings = {
				message: "L'id animal devrait seulement être composé de nombres",
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		event.preventDefault();
		display_mode = 1;
		start_time = Date.now();
		request(idanimal).then((data) => {
			if (data !== null) {
				setTimeout(
					() => {
						display_mode = 2;
					},
					Math.max(0, start_time + 1000 - Date.now())
				);
			}
		});
	}

	function round(str: string) {
		return Math.round(parseFloat(str.replace(/[^\d.-]/g, '')));
	}

	function round100(nbr: number) {
		return Math.round(nbr / 100) * 100;
	}
</script>

<div class="h-full flex items-center justify-center">
	{#if display_mode == 0}
		<form class="flex gap-10 items-center justify-between" on:submit={make_prediction}>
			<input
				class="input p-4 pb-2 pt-2 w-auto"
				type="search"
				name="demo"
				placeholder="Id de l'animal"
				bind:value={idanimal}
			/>
			<button type="submit" class="btn btn-lg variant-filled-primary"
				>Générer la prédiction ✨</button
			>
		</form>
	{:else if display_mode == 1}
		<div class="flex flex-col gap-10 items-center justify-between">
			<ProgressBar />
			<h1 class="h1">Génération de la réponse</h1>
		</div>
	{:else if display_mode == 2}
		<div class="flex flex-col gap-10 items-center justify-between">
			<div class="card card-hover overflow-hidden w-100 text-2xl">
				<header class="h-[300px] overflow-hidden">
					<img src="champ.jpg" class="bg-black/50 h-[300px] w-auto" alt="Post" />
				</header>
				<div class="p-4 space-y-4">
					<h6 class="h3" data-toc-ignore>Prédiction</h6>
					<h3 class="h2" data-toc-ignore>Animal id : FR{idanimal}</h3>
					<article>
						<p class="flex items-center gap-3">
							Qualification en station : {#if prediction.libeco2 == 'None'}
								<Icon icon="emojione-v1:cross-mark" width="16" height="16" />
							{:else if prediction.libeco2 == '1'}
								RJ
							{:else}
								Espoir
							{/if}
						</p>
						<p class="flex items-center gap-3">
							Qualification raciale : {#if prediction.libeco3 == 'None'}
								<Icon icon="emojione-v1:cross-mark" width="16" height="16" />
							{:else if prediction.libeco3 == '0'}
								Non classé
							{:else if prediction.libeco3 == '1'}
								RR
							{:else}
								RRE
							{/if}
						</p>
						<p class="flex items-center gap-3">
							Poids à la naissance : {#if prediction.naissance == 'None'}
								<Icon icon="emojione-v1:cross-mark" width="16" height="16" />
							{:else}
								{round(prediction.naissance)} kg
							{/if}
						</p>
						<p class="flex items-center gap-3">
							Poids 210 jours : {#if prediction.poids == 'None'}
								<Icon icon="emojione-v1:cross-mark" width="16" height="16" />
							{:else}
								{round(prediction.poids)} kg
							{/if}
						</p>
						<p class="flex items-center gap-3">
							Prix : {#if prediction.prix == 'None'}
								<Icon icon="emojione-v1:cross-mark" width="16" height="16" />
							{:else}
								{round100(round(prediction.prix))} €
							{/if}
						</p>
					</article>
				</div>
			</div>
			<button
				type="button"
				class="btn variant-filled-primary"
				on:click={() => {
					display_mode = 0;
				}}>Nouvelle Prédiction</button
			>
		</div>
	{/if}
</div>
