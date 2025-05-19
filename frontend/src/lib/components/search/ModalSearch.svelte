<script lang="ts">
	import { onDestroy, onMount, type SvelteComponent } from 'svelte';
	import {
		Autocomplete,
		getModalStore,
		getToastStore,
		InputChip,
		RangeSlider,
		type AutocompleteOption,
		type ToastSettings
	} from '@skeletonlabs/skeleton';

	import 'leaflet/dist/leaflet.css';
	import { request } from '$lib/script/request';

	let mapContainer: HTMLElement | null = null;
	let map: any;
	let circle: any;

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let parent: SvelteComponent;

	let lat: number | undefined = $modalStore[0].meta.settings.lat;
	let long: number | undefined = $modalStore[0].meta.settings.long;
	let radius: number = $modalStore[0].meta.settings.radius ?? 20000;
	let tags: string[] = $modalStore[0].meta.settings.tags ?? [];
	let fame_rate: number | undefined = $modalStore[0].meta.settings.fame_rate;
	let minAge: number | undefined = $modalStore[0].meta.settings.minAge;
	let maxAge: number | undefined = $modalStore[0].meta.settings.maxAge;

	let max: number = 40000;

	let all_tags: string[] = [];
	let TagOptions: AutocompleteOption<string>[] = [];
	let tag: string = '';

	onMount(async () => {
		const res = await request('/api/tag/all', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to fetch tags',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			parent.onClose();
			return;
		}

		const data_tags = await res.json();

		if (data_tags) {
			const settags = new Set(tags);
			TagOptions = data_tags
				.filter((item: string) => !settags.has(item))
				.map((tag: string) => ({
					label: tag,
					value: tag
				}));
			all_tags = data_tags;
		}

		const L = await import('leaflet');
		let { user_lat, user_long } = $modalStore[0].meta;

		if ($modalStore[0].meta.settings.lat && $modalStore[0].meta.settings.long) {
			user_lat = $modalStore[0].meta.settings.lat;
			user_long = $modalStore[0].meta.settings.long;
		}
		map = L.map(mapContainer).setView([user_lat ?? 51.505, user_long ?? -0.09], 10);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

		const marker = L.marker([user_lat ?? 51.505, user_long ?? -0.09], { draggable: true }).addTo(
			map
		);

		circle = L.circle([user_lat ?? 51.505, user_long ?? -0.09], {
			color: 'blue',
			fillColor: '#add8e6',
			fillOpacity: 0.5,
			radius: radius
		}).addTo(map);

		marker.on('dragend', (event: any) => {
			const position = marker.getLatLng();
			lat = position.lat;
			long = position.lng;

			circle.setLatLng(position);
		});

		map.on('click', (event: any) => {
			lat = event.latlng.lat;
			long = event.latlng.lng;

			marker.setLatLng(event.latlng);
			circle.setLatLng(event.latlng);
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function onRadiusChange(): void {
		if (circle) {
			circle.setRadius(radius);
		}
	}

	function onFormSubmit(event: Event): void {
		event.preventDefault();
		if (maxAge && minAge && maxAge < minAge) {
			const t: ToastSettings = {
				message: 'Max age must be greater than min age',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			parent.onClose();
			return;
		}
		if ((maxAge && !minAge) || (!maxAge && minAge)) {
			const t: ToastSettings = {
				message: 'You must have Min Age and Max Age',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			parent.onClose();
			return;
		}
		if (fame_rate && (fame_rate < 0 || fame_rate > 1)) {
			const t: ToastSettings = {
				message: 'Fame rate must be between 0 and 1',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			parent.onClose();
			return;
		}
		if (radius < 2500 || radius > 40000) {
			const t: ToastSettings = {
				message: 'Radius must be between 2500 and 40000',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			parent.onClose();
			return;
		}
		const settings = {
			lat,
			long,
			radius: long && lat ? radius : undefined,
			tags: tags.length !== 0 ? tags : undefined,
			fame_rate,
			minAge,
			maxAge,
			username: $modalStore[0].meta.settings.username ?? ''
		};
		if ($modalStore[0].response) $modalStore[0].response(settings);
		modalStore.close();
	}

	function onFlavorSelectionTag(event: CustomEvent<AutocompleteOption<string>>): void {
		if (tags.includes(event.detail.label) === false) {
			tags = [...tags, event.detail.label];
			tag = '';
		}
	}

	function inputChipValidation(value: string): boolean {
		if (!all_tags.includes(value)) {
			return false;
		}
		return true;
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
		<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>

		<form>
			<div class="p-4">
				<h3 class="h3">Location :</h3>
				<div class="ml-10 mb-4">
					<div id="map" class="w-full h-[400px]" bind:this={mapContainer}></div>
					<RangeSlider
						name="range-slider"
						bind:value={radius}
						{max}
						min={2500}
						step={100}
						on:change={onRadiusChange}
					>
						<div class="flex justify-between items-center">
							<div class="font-bold">Radius</div>
							<div class="text-xs">{radius} / {max}</div>
						</div>
					</RangeSlider>
				</div>
				<h3 class="h3">Age :</h3>
				<div class="ml-10 mb-4">
					<label class="label">
						<span>Min Age :</span>
						<input
							type="number"
							class="input w-1/2 p-2 ml-4"
							placeholder="Min Age"
							bind:value={minAge}
							min="18"
							max={maxAge}
							step="1"
						/>
					</label>
					<label class="label">
						<span>Max Age :</span>
						<input
							type="number"
							class="input w-1/2 p-2 ml-4"
							placeholder="Max Age"
							bind:value={maxAge}
							min={minAge}
							max="100"
							step="1"
						/>
					</label>
				</div>
				<h3 class="h3">Tags :</h3>
				<div class="ml-10 mb-4">
					<div class="flex items-center">
						<InputChip
							bind:input={tag}
							bind:value={tags}
							name="chips"
							validation={inputChipValidation}
						/>
					</div>

					<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]" tabindex="-1">
						<Autocomplete
							bind:input={tag}
							options={TagOptions}
							on:selection={onFlavorSelectionTag}
							denylist={tags}
						/>
					</div>
				</div>
				<h3 class="h3">Fame Rate :</h3>
				<div class="ml-10 mb-4">
					<input
						type="number"
						class="input w-1/2 p-2"
						placeholder="Fame rate"
						bind:value={fame_rate}
						min="0"
						max="1"
						step="0.1"
					/>
				</div>
				<!-- prettier-ignore -->
				<footer class="modal-footer {parent.regionFooter}">
					<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
					<button class="btn {parent.buttonPositive}" type="submit"  on:click={onFormSubmit}>{parent.buttonTextSubmit}</button>
				</footer>
			</div>
		</form>
	</div>
{/if}
