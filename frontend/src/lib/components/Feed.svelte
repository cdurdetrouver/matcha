<script lang="ts">
	import Icon from '@iconify/svelte';

	export let feeds: string[];
</script>

<div class="scrollbar-none size-full snap-y snap-mandatory overflow-y-scroll">
	{#each feeds as feed}
		<div class="snap-start size-full flex flex-col items-center justify-center">
			<div
				class="card variant-filled-surface test h-[80%] flex flex-col items-center justify-between p-0 m-0 overflow-hidden"
			>
				<header class="card-header bg-black h-[60%]">
					<img src="/user.jpeg" alt="test" class="h-full w-auto" />
				</header>
				<section class="p-4">{feed}</section>
				<footer class="card-footer flex justify-between items-center w-[50%] h-[10%]">
					<button class="btn p-0">
						<Icon icon="mdi:heart" style="color: cyan" width="50" />
					</button>
					<button class="btn p-0">
						<Icon icon="mdi:heart" style="color: red" width="50" />
					</button>
				</footer>
			</div>
		</div>
	{/each}
</div>

<style lang="postcss">
	.test {
		aspect-ratio: 1/2;
	}
</style>
