<script lang="ts">
    import { onMount } from 'svelte';

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

	import HomeHero from '../lib/components/HomeHero.svelte';
</script>

<header id="hero">
	<div class="section-container"><HomeHero /></div>
</header>

<p>Message from back : {message}</p>
<button on:click={() => create_user()}>Click me</button>
<style type="postcss">
	.section-container {
		@apply w-full max-w-7xl mx-auto p-4 py-16 md:py-24;
	}
</style>
