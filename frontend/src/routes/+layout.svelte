<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';
	import MainAppBar from '$lib/components/MainAppBar.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data;
</script>

<svelte:head>
	<title>Matcha</title>
</svelte:head>

<Toast />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<MainAppBar user={data.user ?? null} />
	</svelte:fragment>
	<slot />
</AppShell>
