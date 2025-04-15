<script lang="ts">
	import { request } from '$lib/script/request';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let feeds: string[];

	onMount(async () => {
		var Cards = document.querySelectorAll('.tinder--card') as NodeListOf<HTMLElement>;
		var PlaceHolders = document.querySelectorAll('.placeholder') as NodeListOf<HTMLElement>;

		Cards.forEach((card, index) => {
			const post = feeds[index];
			const placeholder = PlaceHolders[index];
			var textelement = placeholder.querySelector('#text') as HTMLElement;
			var hammertime = new Hammer(card);

			hammertime.on('pan', function (ev) {
				ev.target.classList.add('moving');

				var xMulti = ev.deltaX * 0.03;
				var yMulti = ev.deltaY / 80;

				var rotate = xMulti + yMulti;

				ev.target.style.transform =
					'translate(-50%, -50%) translate(' +
					ev.deltaX +
					'px, ' +
					ev.deltaY +
					'px) rotate(' +
					rotate +
					'deg)';

				if (ev.deltaX > 0) {
					placeholder.classList.remove('placeholder');
					placeholder.classList.add('friend');
					placeholder.classList.remove('love');
					textelement.innerHTML = 'friend';
				} else if (ev.deltaX < 0) {
					placeholder.classList.add('love');
					placeholder.classList.remove('friend');
					textelement.innerHTML = 'love';
				}
			});

			hammertime.on('panend', function (event) {
				event.target.classList.remove('moving');
				event.target.style.transform = 'translate(-50%, -50%)';

				placeholder.classList.remove('love');
				placeholder.classList.remove('friend');
				placeholder.style.backgroundColor = '';
			});

			hammertime.on('swipe', async function (ev) {
				feeds = feeds.filter((_, i) => i !== index);
			});
		});
	});
</script>

<svelte:head>
	<script async src="https://hammerjs.github.io/dist/hammer.min.js"></script>
	<meta
		name="viewport"
		content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"
	/>
</svelte:head>

<div class="scrollbar-none size-full snap-y snap-mandatory overflow-y-scroll">
	{#each feeds as feed}
		<div class="relative snap-start size-full">
			<div
				class="tinder--card bg-black size-full md:h-[90%] md:w-[30%] overflow-hidden rounded-3xl shadow-2xl select-none relative"
			>
				<div class="absolute size-full flex items-center justify-center">
					<img class="size-full object-contain" src={feed} alt="test" />
				</div>
				<div class=" absolute size-full flex items-end flex-col justify-end p-10">
					<a href="/user/1" class="z-[10]">
						<Avatar
							src="/blast.jpg"
							border="border-4 border-surface-300-600-token hover:!border-primary-500"
							cursor="cursor-pointer"
						/>
					</a>
				</div>
			</div>
			<div class="placeholder size-full md:h-[90%] md:w-[30%] rounded-3xl shadow-2xl">
				<h1 id="text" class="h1">ok</h1>
			</div>
		</div>
	{/each}
</div>

<style lang="postcss">
	.tinder--card {
		cursor: -webkit-grab;
		cursor: -moz-grab;
		cursor: grab;
		position: absolute;
		will-change: transform;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		will-change: transform;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		user-select: none;
		overflow: hidden;
		z-index: -1;
		background-color: orange;
	}
	.friend {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		will-change: transform;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		user-select: none;
		overflow: hidden;
		z-index: -1;
		background-color: blue;
	}

	.love {
		background-color: red;
		display: flex;
	}

	.tinder--card img,
	.tinder--card .absolute {
		will-change: transform;
		transform: none;
		pointer-events: none;
	}

	.moving.tinder--card {
		cursor: -webkit-grabbing;
		cursor: -moz-grabbing;
		cursor: grabbing;
	}

	.z-context {
		z-index: 100;
	}
</style>
