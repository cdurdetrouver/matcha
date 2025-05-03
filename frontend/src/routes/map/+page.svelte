<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import 'leaflet/dist/leaflet.css';
	import type { User } from '$lib/types/user.js';
	import { goto } from '$app/navigation';
	import { request } from '$lib/script/request';

	export let data;
	const user: User = data.user;

	let mapContainer: HTMLElement | null = null;
	let map: any;
	let Leaf: any;

	let users: User[] = [];
	let users_markers: any[] = [];

	onMount(async () => {
		Leaf = await import('leaflet');

		console.log('User:', user);
		map = Leaf.map(mapContainer).setView([user.lat, user.long], 10);

		Leaf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

		map.on('zoom', handleMapEvent);
		map.on('moveend', handleMapEvent);

		create_user(user, map);
		get_all_users(user.lat, user.long, 10000);
	});

	async function get_all_users(lat: number, long: number, radius: number) {
		const res = await request('/api/user/coordinates', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ lat, long, radius })
		});
		const data = await res.json();
		if (res.status !== 200) {
			console.error('Error fetching users:', data);
			return;
		}

		const existingUserIds = new Set(users.map((user) => user.id));

		users = data.users;

		users_markers = users_markers.filter(({ userId, marker }) => {
			if (!users.some((u) => u.id === userId)) {
				map.removeLayer(marker);
				console.log('Removed marker for user:', userId, lat, long, radius);
				return false;
			}
			return true;
		});

		for (const user of users) {
			if (!existingUserIds.has(user.id)) {
				const marker = create_user(user, map);
				users_markers.push({ userId: user.id, marker });
			}
		}
	}

	function create_user(user: User, map: any) {
		var user_icon = Leaf.icon({
			iconUrl: user.avatar?.link,
			shadowUrl: 'http://localhost:5173/node_modules/leaflet/dist/images/marker-icon-2x.png',

			iconSize: [55 / 1.5, 55 / 1.5],
			iconAnchor: [27.5 / 1.5, 105 / 1.5],
			shadowSize: [76 / 1.5, 116 / 1.5],
			shadowAnchor: [38 / 1.5, 116 / 1.5],
			className: 'test'
		});

		const marker = Leaf.marker([user.lat, user.long], { icon: user_icon }).addTo(map);

		marker.on('click', (event: any) => {
			goto('/user/' + user.id);
		});

		return marker;
	}

	function handleMapEvent(event: any) {
		const mapCenter = map.getCenter();

		const bounds = map.getBounds();

		const radius = mapCenter.distanceTo(bounds.getNorthEast());

		get_all_users(mapCenter.lat, mapCenter.lng, radius);
	}

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="size-full" bind:this={mapContainer}></div>
<img
	src="https://cdn.discordapp.com/attachments/1121950986582036480/1159999822056142908/taureau.jpg"
	alt="Marty Logo"
	class="hidden test"
/>

<style lang="postcss">
	:global(.test) {
		border-radius: 40%;
	}
</style>
