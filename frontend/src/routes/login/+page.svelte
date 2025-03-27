<script lang="ts">
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import Login from '$lib/components/Login/Login.svelte';
	import Register from '$lib/components/Login/Register.svelte';

	let tabSet: boolean = true;
</script>

<div class="size-full flex items-center justify-center">
	<section class="w-[20vw] min-w-[300px] card p-4 text-token">
		<TabGroup>
			<Tab bind:group={tabSet} name="login" value={true}>Login</Tab>
			<Tab bind:group={tabSet} name="register" value={false}>Register</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === true}
					<Login />
				{:else if tabSet === false}
					<Register />
				{/if}
			</svelte:fragment>
		</TabGroup>
	</section>
</div>
