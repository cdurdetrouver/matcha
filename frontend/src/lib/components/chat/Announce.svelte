<script lang="ts">
	import type { Message } from '$lib/types/chat';

	export let message:Message;
</script>

<div class="w-full text-center">
	<p class="p-4">{message.message}</p>
</div>