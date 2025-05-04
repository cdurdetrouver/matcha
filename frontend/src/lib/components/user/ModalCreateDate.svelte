<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { request } from '$lib/script/request';

	export let parent: SvelteComponent;

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	let other_user_id: number = $modalStore[0].meta.user_id;
	let description: string = '';
	let time: string = '';

	async function onFormSubmit(): Promise<void> {
		if (!description || !time) {
			const t = {
				message: 'Please fill in all fields',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const timestamp = new Date(time).getTime();

		const res = await request('/api/date/set', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				other_user_id,
				description,
				time: timestamp
			})
		});

		if (!res.ok) {
			console.log(await res.json());
			const t = {
				message: 'Failed to create date',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
		} else {
			const data = await res.json();
			if (data.message) {
				const t = {
					message: data.message,
					background: 'variant-filled-success'
				};
				toastStore.trigger(t);
			}
		}
		modalStore.close();
	}

	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<form class="modal-form {cForm}">
			<label class="label">
				<span>Description</span>
				<textarea
					class="textarea p-4"
					bind:value={description}
					placeholder="Enter description..."
					rows="4"
					maxlength="200"
					required
				></textarea>
			</label>
			<label class="label">
				<span>Date & Time</span>
				<input class="input p-4" type="datetime-local" bind:value={time} required />
			</label>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{parent.buttonTextSubmit}</button>
		</footer>
	</div>
{/if}
