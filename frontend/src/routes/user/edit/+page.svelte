<script lang="ts">
	import type { User } from '$lib/types/user';
	import type { Image } from '$lib/types/image';
	import { goto } from '$app/navigation';
	import { logoutUser, request } from '$lib/script/request';
	import { onMount } from 'svelte';
	import {
		Avatar,
		getToastStore,
		type ToastSettings,
		getModalStore,
		type ModalSettings,
		type ModalComponent,
		RadioGroup,
		RadioItem
	} from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import ModalDropzone from '$lib/components/user/ModalDropzone.svelte';
	import ModalInterests from '$lib/components/user/ModalInterests.svelte';
	import ModalPassword from '$lib/components/user/ModalPassword.svelte';
	import ModalLocation from '$lib/components/user/ModalLocation.svelte';
	import { getCurrentPosition } from '$lib/script/location';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	let user: User;
	let city = '';
	let images: Image[] = [];

	let username = '';
	let email = '';
	let latitude = 0;
	let longitude = 0;
	let description = '';
	let interests: string[] = [];
	let wanted = 0;

	$: isModified =
		username !== user?.username ||
		email !== (user?.email ?? '') ||
		latitude !== user.lat ||
		longitude !== user.long ||
		description !== (user?.description ?? '') ||
		JSON.stringify(interests) !== JSON.stringify(user?.interests ?? []) ||
		wanted !== user?.wanted;

	let locationError = '';

	onMount(async () => {
		const req = await request('/api/user/me', {
			method: 'GET',
			credentials: 'include'
		});

		if (!req.ok) {
			await logout();
		}

		const data = await req.json();
		user = data.user as User;
		if (!user) {
			const t: ToastSettings = {
				message: 'Failed to load user data',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}
		city = await getCurrentPosition(user.lat, user.long);
		username = user.username;
		email = user.email ?? '';
		latitude = user.lat;
		longitude = user.long;
		description = user.description ?? '';
		interests = user.interests ?? [];
		wanted = user.wanted;
		const res = await request('/api/user/image/' + user.id, {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to load user image',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/');
		}
		const imageData = await res.json();
		images = imageData.images;
	});

	async function deleteImage(index: number) {
		const res = await request('/api/user/image/' + index, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to delete image',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const t: ToastSettings = {
			message: 'Image deleted successfully',
			background: 'variant-filled-success'
		};
		toastStore.trigger(t);

		images = images.filter((image) => image.id !== index);
	}

	async function logout() {
		await logoutUser();
		goto('/login');
	}

	function requestLocation() {
		const c: ModalComponent = { ref: ModalLocation };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Change lcoation',
			body: 'Choose your location',
			meta: {
				user_lat: user.lat !== 0 ? user.lat : undefined,
				user_long: user.long !== 0 ? user.long : undefined
			},
			response: async (r) => {
				if (r) {
					latitude = r.lat;
					longitude = r.long;
					locationError = '';
					city = await getCurrentPosition(r.lat, r.long);
				}
			}
		};
		modalStore.trigger(modal);
	}

	function openUploadModal() {
		const c: ModalComponent = { ref: ModalDropzone };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Add a new Image',
			body: 'Choose a file and then press submit.',
			response: (r) => {
				if (r) {
					const formData = new FormData();
					formData.append('file', r[0]);

					request('/api/user/image', {
						method: 'POST',
						body: formData,
						credentials: 'include'
					})
						.then(async (res) => {
							if (res.ok) {
								toastStore.trigger({
									message: 'Image uploaded successfully',
									background: 'variant-filled-success'
								});
								const data_res = await res.json();
								images = [...images, data_res.image];
							} else {
								toastStore.trigger({
									message: 'Failed to upload image',
									background: 'variant-filled-error'
								});
							}
						})
						.catch((error) => {
							console.error('Error uploading image:', error);
							toastStore.trigger({
								message: 'Failed to upload image',
								background: 'variant-filled-error'
							});
						});
				}
			}
		};
		modalStore.trigger(modal);
	}

	function openAvatarModal() {
		const c: ModalComponent = { ref: ModalDropzone };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Choose your avatar',
			body: 'Choose your file and then press submit.',
			response: (r) => {
				if (r) {
					const formData = new FormData();
					formData.append('avatar', r[0]);

					request('/api/user/avatar', {
						method: 'POST',
						body: formData,
						credentials: 'include'
					})
						.then(async (res) => {
							if (res.ok) {
								toastStore.trigger({
									message: 'Avatar uploaded successfully',
									background: 'variant-filled-success'
								});
								const data_res = await res.json();
								user.avatar = data_res.image;
							} else {
								toastStore.trigger({
									message: 'Failed to upload avatar',
									background: 'variant-filled-error'
								});
							}
						})
						.catch((error) => {
							console.error('Error uploading avatar:', error);
							toastStore.trigger({
								message: 'Failed to upload avatar',
								background: 'variant-filled-error'
							});
						});
				}
			}
		};
		modalStore.trigger(modal);
	}

	function openIntersetModal() {
		const c: ModalComponent = { ref: ModalInterests };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Custom Form Component',
			body: 'Complete the form below and then press submit.',
			meta: interests,
			response: (r) => {
				if (r) interests = r;
			}
		};
		modalStore.trigger(modal);
	}

	function openPasswordModal() {
		const c: ModalComponent = { ref: ModalPassword };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Change Password',
			body: 'Complete the form below and then press submit.',
			meta: interests,
			response: (r) => {
				if (r) {
					request('/api/user/password', {
						method: 'POST',
						body: JSON.stringify({
							old_password: r.old_password,
							password: r.password
						}),
						credentials: 'include'
					})
						.then(async (res) => {
							if (res.ok) {
								toastStore.trigger({
									message: 'Password changed successfully',
									background: 'variant-filled-success'
								});
							} else {
								toastStore.trigger({
									message: 'Failed to change password',
									background: 'variant-filled-error'
								});
							}
						})
						.catch((error) => {
							console.error('Error changing password:', error);
							toastStore.trigger({
								message: 'Failed to change password',
								background: 'variant-filled-error'
							});
						});
				}
			}
		};
		modalStore.trigger(modal);
	}

	function editInfo(confirm: boolean = false) {
		request('/api/user/edit', {
			method: 'PUT',
			body: JSON.stringify({
				username: username !== user?.username ? username : undefined,
				email: email !== user?.email ? email : undefined,
				description: description !== user?.description ? description : undefined,
				latitude: latitude !== user?.lat ? latitude : undefined,
				longitude: longitude !== user?.long ? longitude : undefined,
				interests:
					JSON.stringify(interests) !== JSON.stringify(user?.interests) ? interests : undefined,
				wanted: wanted !== user?.wanted ? wanted : undefined
			}),
			credentials: 'include'
		})
			.then(async (res) => {
				if (res.ok) {
					toastStore.trigger({
						message: 'Profile updated successfully',
						background: 'variant-filled-success'
					});
					if (confirm) {
						await logoutUser();
						goto('/login');
					} else {
						const data_res = await res.json();
						user = data_res.user as User;
						city = await getCurrentPosition(user.lat, user.long);
						username = user.username;
						email = user.email ?? '';
						latitude = user.lat;
						longitude = user.long;
						description = user.description ?? '';
						interests = user.interests ?? [];
						wanted = user.wanted;
					}
				} else {
					toastStore.trigger({
						message: 'Failed to update profile',
						background: 'variant-filled-error'
					});
				}
			})
			.catch((error) => {
				console.error('Error updating profile:', error);
				toastStore.trigger({
					message: 'Failed to update profile',
					background: 'variant-filled-error'
				});
			});
	}

	function completeProfile() {
		if (email !== user?.email) {
			const modal: ModalSettings = {
				type: 'confirm',
				title: 'Email Change',
				body: 'You have changed your email. If you confirm, you will be logged out and you will need to confirm your new email.',
				response: async (r) => {
					if (r) {
						editInfo(true);
					}
				}
			};
			modalStore.trigger(modal);
		} else {
			editInfo();
		}
	}
</script>

{#if user}
	<div class="placehodler flex flex-col items-center w-full max-w-4xl mx-auto p-4">
		<!-- Profile Header -->
		<div class="flex flex-col md:flex-row items-center md:items-start gap-6 w-full border-b pb-6">
			<!-- Avatar -->
			<div class="relative">
				<!-- Avatar -->
				<Avatar
					src={user.avatar?.link}
					alt="User Avatar"
					rounded="rounded-3xl"
					shadow="shadow-xl"
					class="h-full w-auto object-contain"
				/>

				<!-- Edit Icon -->
				<button
					class="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
					on:click={openAvatarModal}
				>
					<Icon icon="mdi:pencil" width="1em" />
				</button>
			</div>

			<!-- User Info -->
			<div class="flex flex-col items-center md:items-start gap-2">
				<!-- Username -->
				<input
					type="text"
					class="input text-2xl font-bold p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					bind:value={username}
					placeholder="Enter your username"
				/>

				<!-- Email -->
				<input
					type="email"
					class="input text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					bind:value={email}
					placeholder="Enter your email"
					disabled={user?.auth_provider !== 'email'}
				/>

				<!-- Description -->
				<textarea
					class="input p-2"
					name="demo"
					bind:value={description}
					placeholder="Enter your description..."
					rows="5"
				/>
				{#if description.length > 280}
					<aside class="alert variant-ghost-warning">
						<div class="alert-message">
							<p>You should have less than 280 characters</p>
						</div>
					</aside>
				{/if}

				<!-- Location -->
				<div class="flex items-center gap-2">
					<Icon icon="mdi:map-marker" width="1.5em" />
					<p class="text-sm">{city}</p>
					<button class="btn variant-filled-primary px-4 py-2" on:click={requestLocation}>
						Change Location
					</button>
					{#if locationError}
						<p class="text-red-500 text-sm">{locationError}</p>
					{/if}
				</div>

				<!-- Status -->
				<div class="flex items-center gap-4">
					<RadioGroup class="w-full uppercase">
						<RadioItem bind:group={wanted} name="justify" value={0}>
							<div class="flex items-center justify-center gap-2">
								<Icon icon="mdi:heart" style="color: #1e90ff" width="1.5em" />
								<p>Friend</p>
							</div>
						</RadioItem>
						<RadioItem bind:group={wanted} name="justify" value={1}>
							<p>Both</p>
						</RadioItem>
						<RadioItem bind:group={wanted} name="justify" value={2}>
							<div class="flex items-center justify-center gap-2">
								<p>Love</p>
								<Icon icon="mdi:heart" style="color: #e32636" width="1.5em" />
							</div>
						</RadioItem>
					</RadioGroup>
				</div>

				<!-- Interests -->
				<div class="flex items-center gap-4">
					<button class="btn variant-filled-primary px-4 py-2" on:click={openIntersetModal}>
						Change Tags
					</button>
				</div>
				{#if user?.complete_profile == false}
					<a href="/complete" class="btn variant-filled mt-4">Complete your profile</a>
				{/if}
			</div>

			<!-- Save Button -->
			<div class="flex flex-col md:flex-row gap-2 md:ml-auto">
				<button
					class="btn variant-filled-primary px-6 py-2"
					type="button"
					on:click={openPasswordModal}
				>
					Change Password
				</button>
				<button
					class="btn variant-filled-primary px-6 py-2"
					type="button"
					on:click={completeProfile}
					disabled={!isModified}
				>
					Save
				</button>
			</div>
		</div>

		<!-- Image Grid -->
		<section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 w-full">
			{#each images as image}
				<div
					class="relative group aspect-[0.75] overflow-hidden bg-black flex items-center justify-center rounded-lg"
				>
					<img
						src={image.link}
						alt="Preview"
						class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
					/>
					<button
						class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						on:click={() => deleteImage(image.id)}
					>
						<Icon icon="mdi:trash-can" width="1.5em" />
					</button>
				</div>
			{/each}

			<!-- Show Dropzone if images.length < 5 -->
			{#if images.length < 5}
				<div
					class="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 hover:border-gray-600 transition-all"
				>
					<Icon icon="mdi:cloud-upload-outline" width="3em" class="text-gray-500 mb-2" />
					<p class="text-gray-500 text-sm mb-2">
						You can upload up to {5 - images.length} more images
					</p>
					<button class="btn variant-filled-primary px-4 py-2" on:click={openUploadModal}>
						Upload New Post
					</button>
				</div>
			{/if}
		</section>
	</div>
{/if}
