<script lang="ts">
	import {
		RadioGroup,
		RadioItem,
		Autocomplete,
		popup,
		FileDropzone,
		Stepper,
		Step,
		InputChip
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';
	import { request } from '$lib/script/request';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { User } from '$lib/types/user';
	import { update_user } from '$lib/script/request';

	const toastStore = getToastStore();

	export let data;

	let tags: string[] = [];
	let TagOptions: AutocompleteOption<string>[] = [];

	const GenderOptions: AutocompleteOption<string>[] = [
		{ label: 'Male', value: 'male' },
		{ label: 'Female', value: 'female' },
		{ label: 'Non-binary', value: 'non-binary' },
		{ label: 'Genderqueer', value: 'genderqueer' },
		{ label: 'Genderfluid', value: 'genderfluid' },
		{ label: 'Agender', value: 'agender' },
		{ label: 'Other', value: 'other' }
	];

	let GenderpopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'GenderpopupAutocomplete',
		placement: 'bottom'
	};

	const SexualOptions: AutocompleteOption<string>[] = [
		{ label: 'Heterosexual', value: 'male' },
		{ label: 'Homosexual', value: 'female' },
		{ label: 'Bisexual', value: 'non-binary' },
		{ label: 'Asexual', value: 'genderqueer' },
		{ label: 'Pansexual', value: 'genderfluid' },
		{ label: 'Demisexual', value: 'agender' },
		{ label: 'Queer', value: 'other' },
		{ label: 'Polysexual', value: 'other' },
		{ label: 'Other', value: 'other' }
	];

	let SexualpopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'SexualpopupAutocomplete',
		placement: 'bottom'
	};

	let value: number = data.user?.wanted ?? 1;
	let inputGender = data.user?.gender ?? '';
	let inputSexual = data.user?.sexual_preferences ?? '';
	let birthdate = data.user?.birthdate ?? '';
	let mbti = data.user?.mbti ?? '';
	let description = data.user?.description ?? '';
	let dropzoneFiles: (FileList | undefined)[] = Array(6).fill(undefined);
	let userLocation: { latitude: number | null; longitude: number | null; city: string } = {
		latitude: null,
		longitude: null,
		city: ''
	};

	let locationError = '';
	let locationSearch: boolean = false;
	let mytags: string[] = [];
	let tag: string;

	onMount(async () => {
		if (data.user.complete_profile) {
			goto('/user');
		}

		const res = await request('/api/tag/all', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const t: ToastSettings = {
				message: 'Failed to fetch tags',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			goto('/user');
		}

		const data_tags = await res.json();

		if (data_tags) {
			TagOptions = data_tags.map((tag: string) => ({
				label: tag,
				value: tag
			}));
		}
	});

	function isBirthdateValid(date: string): boolean {
		if (!date) return false;

		const birthDate = new Date(date);
		const today = new Date();

		const age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		const dayDiff = today.getDate() - birthDate.getDate();

		if (age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))) {
			return true;
		}

		return false;
	}

	async function getCurrentPosition(latitude: number, longitude: number) {
		try {
			const response = await fetch(
				`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
			);
			const data = await response.json();
			if (data) {
				userLocation.city = data.city;
			}
		} catch (error) {
			console.error('Error fetching location data :', error);
		}
	}

	async function fetchLocationByIP() {
		try {
			const response = await fetch('http://ip-api.com/json/');
			if (!response.ok) throw new Error('Failed to fetch location by IP');
			const data = await response.json();
			return {
				latitude: data.lat,
				longitude: data.lon,
				city: data.city || 'Unknown'
			};
		} catch (error) {
			console.error('Failed to fetch location by IP:', error);
			return null;
		}
	}

	function requestLocation() {
		locationSearch = true;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					userLocation.latitude = position.coords.latitude;
					userLocation.longitude = position.coords.longitude;
					locationError = '';
					await getCurrentPosition(position.coords.latitude, position.coords.longitude);
					locationSearch = false;
				},
				async (error) => {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							locationError = 'User denied the request for Geolocation.';
							break;
						case error.POSITION_UNAVAILABLE:
							locationError = 'Location information is unavailable.';
							break;
						case error.TIMEOUT:
							locationError = 'The request to get user location timed out.';
							break;
						default:
							locationError = 'An unknown error occurred.';
							break;
					}
					const res = await fetchLocationByIP();
					if (res) {
						userLocation = res;
						locationError = '';
						locationSearch = false;
					}
				}
			);
		} else {
			locationError = 'Geolocation is not supported by this browser.';
		}
	}

	function isValidOption(Options: AutocompleteOption<string>[], input: string): boolean {
		return Options.some((option) => option.label === input);
	}

	function onFlavorSelectionGender(event: CustomEvent<AutocompleteOption<string>>): void {
		inputGender = event.detail.label;
	}

	function onFlavorSelectionSexual(event: CustomEvent<AutocompleteOption<string>>): void {
		inputSexual = event.detail.label;
	}

	function inputChipValidation(value: string): boolean {
		if (!tags.includes(value)) {
			return false;
		}
		return true;
	}

	function onFlavorSelectionTag(event: CustomEvent<AutocompleteOption<string>>): void {
		if (mytags.includes(event.detail.label) === false) {
			mytags = [...mytags, event.detail.label];
			tag = '';
		}
	}

	async function createTag(): Promise<void> {
		if (tag && !mytags.includes(tag)) {
			const res = await request('/api/tag/create', {
				method: 'POST',
				body: JSON.stringify({ tag_name: tag }),
				credentials: 'include'
			});
			if (!res.ok) {
				const t: ToastSettings = {
					message: 'Failed to create tag',
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				return;
			}
			const data = await res.json();
			mytags = [...mytags, tag];
			TagOptions = [...TagOptions, { label: tag, value: tag }];
			tag = '';
			tags = [...tags, data.tag_name];
		}
	}

	function deleteImage(index: number): void {
		dropzoneFiles[index] = undefined;
	}

	function isPhotoValid(Files: (FileList | undefined)[]) {
		if (Files[0] === undefined && !data.user?.avatar) return false;

		const allOtherFilesUndefined = Files.slice(1).every((file) => file === undefined);

		if (allOtherFilesUndefined) return false;

		return true;
	}

	async function complete() {
		try {
			let avatar = dropzoneFiles[0];
			if (avatar) {
				const avatarFormData = new FormData();
				avatarFormData.append('avatar', avatar[0]);
				const req = await request('/api/user/avatar', {
					method: 'POST',
					body: avatarFormData,
					credentials: 'include'
				});

				if (!req.ok) {
					throw new Error('Failed to upload avatar');
				}
			}
			for (let i = 1; i < dropzoneFiles.length; i++) {
				const file = dropzoneFiles[i];

				if (file) {
					const fileFormData = new FormData();
					fileFormData.append('file', file[0]);

					const req = await request('/api/user/image', {
						method: 'POST',
						body: fileFormData,
						credentials: 'include'
					});

					if (!req.ok) {
						throw new Error('Failed to upload image');
					}
				}
			}

			const req2 = await request('/api/user/full_register', {
				method: 'POST',
				body: JSON.stringify({
					description,
					gender: inputGender,
					sexual: inputSexual,
					location: [userLocation.latitude, userLocation.longitude],
					wanted: value,
					interests: mytags,
					birthdate,
					mbti: mbti.toUpperCase()
				}),
				credentials: 'include'
			});

			if (!req2.ok) {
				throw new Error('Failed to complete registration');
			}

			const data_res = await req2.json();

			const user = data_res.user as User;

			await update_user(user);

			const t: ToastSettings = {
				message: 'You have successfully completed your profile 🎉',
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);

			goto('/');
		} catch (error) {
			const t: ToastSettings = {
				message: 'Error while complete: ' + error,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
		}
	}

	function checkMBTI(mbti: string): boolean {
		const regex = /^[IE][NS][TF][JP]$/;
		return regex.test(mbti.trim().toUpperCase());
	}
</script>

<main class="flex items-center justify-center size-full">
	<div class="card p-4 text-token">
		<Stepper on:complete={complete}>
			<Step>
				<svelte:fragment slot="header">Welcome to our app</svelte:fragment>
				<p class="text-center">
					We are glad to have you here. Please complete your profile to get started
				</p>
			</Step>
			<Step locked={!isBirthdateValid(birthdate)}>
				<svelte:fragment slot="header">Choose your birth date</svelte:fragment>
				<input
					class="input p-2"
					type="date"
					name="birthdate"
					placeholder="Birth date..."
					bind:value={birthdate}
				/>
				<div class="flex gap-2 items-center">
					<Icon icon="material-symbols:info-outline" />
					<p class="code">You must at least have 18 years old</p>
				</div>
			</Step>
			<Step
				locked={userLocation.city === '' ||
					userLocation.latitude === null ||
					userLocation.longitude === null}
			>
				<svelte:fragment slot="header">We need your location</svelte:fragment>
				<div class="size-full flex items-center justify-center gap-5">
					<button
						type="button"
						class="btn variant-filled transition-transform duration-500 ease-in-out
					{locationSearch ? 'animate-pulse' : ''}"
						on:click={requestLocation}
					>
						Request Location
					</button>

					<input
						class="input p-2"
						placeholder="Your location"
						bind:value={userLocation.city}
						readonly
					/>
				</div>
				{#if locationError}
					<p class="text-red-500">{locationError}</p>
				{/if}
			</Step>
			<Step>
				<svelte:fragment slot="header">What are you looking for ?</svelte:fragment>
				<RadioGroup class="w-full uppercase">
					<RadioItem bind:group={value} name="justify" value={0}>
						<div class="flex items-center justify-center gap-2">
							<Icon icon="mdi:heart" style="color: #1e90ff" width="1.5em" />
							<p>Friend</p>
						</div>
					</RadioItem>
					<RadioItem bind:group={value} name="justify" value={1}>
						<p>Both</p>
					</RadioItem>
					<RadioItem bind:group={value} name="justify" value={2}>
						<div class="flex items-center justify-center gap-2">
							<p>Love</p>
							<Icon icon="mdi:heart" style="color: #e32636" width="1.5em" />
						</div>
					</RadioItem>
				</RadioGroup>
			</Step>
			<Step locked={!isValidOption(GenderOptions, inputGender) && value > 0}>
				<svelte:fragment slot="header">What's your gender ?</svelte:fragment>
				<input
					class="input p-2"
					type="search"
					name="demo"
					bind:value={inputGender}
					placeholder="Search..."
					use:popup={GenderpopupSettings}
					disabled={value < 1}
				/>
				<div
					class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]"
					tabindex="-1"
					data-popup="GenderpopupAutocomplete"
				>
					<Autocomplete
						bind:input={inputGender}
						options={GenderOptions}
						on:selection={onFlavorSelectionGender}
					/>
				</div>
				{#if value == 0}
					<aside class="alert variant-ghost-warning">
						<div class="alert-message">
							<p>You should skip this step because you're not looking for some relationship</p>
						</div>
					</aside>
				{/if}
			</Step>
			<Step locked={!isValidOption(SexualOptions, inputSexual) && value > 0}>
				<svelte:fragment slot="header">What are you interrested for ?</svelte:fragment>
				<input
					class="input p-2"
					type="search"
					name="demo"
					bind:value={inputSexual}
					placeholder="Search..."
					use:popup={SexualpopupSettings}
					disabled={value < 1}
				/>
				<div
					class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]"
					tabindex="-1"
					data-popup="SexualpopupAutocomplete"
				>
					<Autocomplete
						bind:input={inputSexual}
						options={SexualOptions}
						on:selection={onFlavorSelectionSexual}
					/>
				</div>
				{#if value == 0}
					<aside class="alert variant-ghost-warning">
						<div class="alert-message">
							<p>You should skip this step because you're not looking for some relationship</p>
						</div>
					</aside>
				{/if}
			</Step>
			<Step>
				<svelte:fragment slot="header">Choose your tags</svelte:fragment>
				<div class="flex items-center">
					<InputChip
						bind:input={tag}
						bind:value={mytags}
						name="chips"
						validation={inputChipValidation}
					/>
					<button
						class="variant-filled-secondary btn h-fit"
						disabled={tags.includes(tag) || tag === ''}
						on:click={createTag}
					>
						Create tag
					</button>
				</div>

				<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto z-[100]" tabindex="-1">
					<Autocomplete
						bind:input={tag}
						options={TagOptions}
						on:selection={onFlavorSelectionTag}
						denylist={mytags}
					/>
				</div>
			</Step>
			<Step locked={checkMBTI(mbti) === false}>
				<svelte:fragment slot="header">What is your MBTI ?</svelte:fragment>
				<input
					class="input p-2"
					type="text"
					name="demo"
					bind:value={mbti}
					placeholder="Enter your MBTI..."
					maxlength="4"
					autocomplete="off"
				/>
				<div class="flex gap-2 items-center">
					<Icon icon="material-symbols:info-outline" />
					<p class="code">
						You can find your MBTI on <a
							href="https://www.16personalities.com/free-personality-test"
							target="_blank"
						>
							16personalities.com
						</a>
					</p>
				</div>
				<p>MBTI should be 4 letters</p>
			</Step>
			<Step locked={description === '' || description.length > 280}>
				<svelte:fragment slot="header">Enter the description of your profile</svelte:fragment>
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
			</Step>
			<Step locked={!isPhotoValid(dropzoneFiles)}>
				<svelte:fragment slot="header"
					>Choose a profile picture and at least one post</svelte:fragment
				>
				<div class="grid grid-cols-3 gap-4 w-full">
					{#each Array(6) as _, index}
						{#if dropzoneFiles[index] || (data.user?.avatar && index === 0)}
							<div
								class="relative rounded-2xl overflow-hidden flex items-center justify-center bg-black group size-full aspect-[0.75]"
							>
								{#if data.user?.avatar && index === 0}
									<img
										src={data.user.avatar.link}
										alt="Preview"
										class="size-full object-contain absolute top-0 left-0"
									/>
								{:else if dropzoneFiles[index]}
									<img
										src={URL.createObjectURL(dropzoneFiles[index][0])}
										alt="Preview"
										class="size-full object-contain absolute top-0 left-0"
									/>
								{/if}
								<button
									class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									on:click={() => deleteImage(index)}
								>
									<Icon icon="mdi:trash-can" width="1.5em" />
								</button>
							</div>
						{:else}
							<FileDropzone
								name={`fileInput${index}`}
								accept="image/*"
								bind:files={dropzoneFiles[index]}
								class="size-full aspect-[0.75]"
							>
								<svelte:fragment slot="lead">
									<i class="flex items-center justify-center">
										<Icon icon="bx:file" width="2em" />
									</i>
								</svelte:fragment>
								<svelte:fragment slot="message">
									{#if index === 0}
										Choose your Profile Picture
									{:else}
										Upload a post
									{/if}
								</svelte:fragment>
								<svelte:fragment slot="meta">PNG, JPG and GIF allowed.</svelte:fragment>
							</FileDropzone>
						{/if}
					{/each}
				</div>
			</Step>
		</Stepper>
	</div>
</main>
