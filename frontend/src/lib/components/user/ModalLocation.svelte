<script lang="ts">
	import { onDestroy, onMount, type SvelteComponent } from 'svelte';
	import { getModalStore, RangeSlider } from '@skeletonlabs/skeleton';

	import 'leaflet/dist/leaflet.css';

	let mapContainer: HTMLElement | null = null;
	let map: any;

	const modalStore = getModalStore();

	export let parent: SvelteComponent;

	let lat: number | undefined = $modalStore[0].meta.lat;
	let long: number | undefined = $modalStore[0].meta.long;

	let max: number = 40000;

	onMount(async () => {
		const L = await import('leaflet');
		let { user_lat, user_long } = $modalStore[0].meta;

		if (!user_lat && !user_long)
			if ($modalStore[0].meta.lat && $modalStore[0].meta.long) {
				user_lat = $modalStore[0].meta.lat;
				user_long = $modalStore[0].meta.long;
			}
		map = L.map(mapContainer).setView([user_lat ?? 51.505, user_long ?? -0.09], 10);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

		const marker = L.marker([user_lat ?? 51.505, user_long ?? -0.09], { draggable: true }).addTo(
			map
		);

		marker.on('dragend', (event: any) => {
			const position = marker.getLatLng();
			lat = position.lat;
			long = position.lng;
		});

		map.on('click', (event: any) => {
			lat = event.latlng.lat;
			long = event.latlng.lng;

			marker.setLatLng(event.latlng);
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function onFormSubmit(event: Event): void {
		event.preventDefault();
		if ($modalStore[0].response) $modalStore[0].response({ long, lat });
		modalStore.close();
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>

		<form>
			<div class="p-4">
				<h3 class="h3">Location :</h3>
				<div class="ml-10 mb-4">
					<div id="map" class="w-full h-[400px]" bind:this={mapContainer}></div>
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
