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

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<p>Message from back : {message}</p>
<button on:click={() => create_user()}>Click me</button>