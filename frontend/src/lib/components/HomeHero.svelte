<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-10 items-center justify-center h-[60vh]">
	<div class="flex flex-col items-center xl:items-start text-center xl:text-left space-y-4 mt-40">
		<h1 class="h1 !text-5xl md:!text-6xl max-w-[600px]">
			The meeting app for <span class="gradient-heading">42</span> Student.
		</h1>
		<p class="!text-xl max-w-[475px]">
			Meet some student of 42 with the same passions at you.
		</p>
		<div class="flex gap-4">
			<a class="btn variant-filled-primary text-xl" href="/prediction" rel="noreferrer">
				Discover the subject
			</a>
		</div>
	</div>
	<div class="hidden md:inline-block w-full max-w-[650px] mx-auto mt-20">
		<div class="aspect-video relative">
			<div class="anim-float-avatar absolute z-[1] left-[23%]">
				<img
					src="handshake.png"
					alt="handsake"
					class="w-[28vw]"
				/>
			</div>
		</div>
	</div>
</div>

<style type="postcss">
	.gradient-heading {
		animation: gradient 3s ease infinite;
		@apply bg-clip-text text-transparent box-decoration-clone;
		@apply bg-gradient-to-br;
		@apply from-primary-500 via-secondary-500 to-primary-500;
	}

	.anim-float-avatar {
		animation: float-up 13s ease-in-out infinite;
	}

	@keyframes float-up {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-30px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	@keyframes float-down {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(30px);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
