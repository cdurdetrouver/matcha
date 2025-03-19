<script lang="ts">
  import { onMount } from 'svelte';
  import HomeHero from '../lib/components/HomeHero.svelte';

let message: string = '';

onMount(async () => {
  try {
	const response = await fetch('http://localhost:8000/api/');
	if (!response.ok) {
	  throw new Error('Failed to fetch the message');
	}
	const data = await response.json();
	console.log(data);
	message = data.message;
  } catch (error) {
	console.error('Error:', error);
  }
});

function create_user() {
	fetch('http://localhost:8000/api/create_user', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: 'test_user',
			password: 'test_passwd'
		})
	})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

function update_user(id: number) {
	fetch(`http://localhost:8000/api/update_user/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: 'mais_noooon',
			password: 'regarde_pas_mon_mdp_stp',
			email: 'lol@gmail.com'
		})
	})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

function get_user(id: number) {
	fetch(`http://localhost:8000/api/get_user/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

function delete_user(id: number) {
	fetch(`http://localhost:8000/api/delete_user/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
}

</script>


<header id="hero">
  <div class="section-container"><HomeHero /></div>
  <p>Message from back : {message}</p>
  <button on:click={() => create_user()}>Create user</button>
  <button on:click={() => get_user(6)}>find user</button>
  <button on:click={() => delete_user(12)}>delete user</button>
  <button on:click={() => update_user(21)}>update user</button>
</header>

<style type="postcss">
	.section-container {
		@apply w-full max-w-7xl mx-auto p-4 py-16 md:py-24;
	}
</style>
