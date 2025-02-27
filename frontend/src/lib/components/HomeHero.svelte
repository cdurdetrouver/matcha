<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-10 items-center justify-center">
	<div class="flex flex-col items-center xl:items-start text-center xl:text-left space-y-4 mt-40">
		<h1 class="h1 !text-5xl md:!text-6xl max-w-[600px]">
			Prédiction de Sélection bovine assistée par <span class="gradient-heading">IA</span>.
		</h1>
		<p class="!text-xl max-w-[475px]">
			Optimisez votre élevage avec notre IA capable d’identifier les meilleurs taureaux
			reproducteurs selon les labels Libeco3 et Libeco2. Une sélection fiable, efficace et durable
			pour un cheptel d’excellence.
		</p>
		<div class="flex gap-4">
			<a class="btn variant-filled text-xl" href="/prediction" rel="noreferrer">
				Commencer la prédiction
			</a>
		</div>
	</div>
	<div class="hidden md:inline-block w-full max-w-[650px] mx-auto mt-20">
		<div class="aspect-video relative">
			<div class="anim-float-avatar absolute z-[1] left-[23%]">
				<Avatar
					src="taureau.jpg"
					alt="Marty Logo"
					rounded="rounded-3xl"
					width="w-[28vw]"
					shadow="shadow-xl"
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
		@apply from-primary-500 via-tertiary-500 to-secondary-500;
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
