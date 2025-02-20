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

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<p>Message from back : {message}</p>