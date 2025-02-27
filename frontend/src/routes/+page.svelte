<script lang="ts">
	import HomeHero from '../lib/components/HomeHero.svelte';
</script>

<header id="hero">
	<div class="section-container"><HomeHero /></div>
</header>

<style type="postcss">
	.section-container {
		@apply w-full max-w-7xl mx-auto p-4 py-16 md:py-24;
	}
</style>
