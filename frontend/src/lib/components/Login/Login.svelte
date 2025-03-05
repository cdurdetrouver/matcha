<script lang="ts">
    export let form;

    if (form?.success)
    {
        console.log("test");
    }
</script>

<main class="flex flex-col gap-4">
    <form class="flex flex-col gap-2 items-start" method="POST" action="?/login">
        <div class="w-full">
            <h2>Email:</h2>
            <input class="input w-2/3 px-2" type="email" name="email" placeholder="Email..." value={form?.email ?? ''} />
            {#if form?.missing_email}<p class="text-red-600">The email field is required</p>{/if}
            {#if form?.incorrect_email}<p class="text-red-600">The email field is incorrect</p>{/if}
        </div>
        <div class="w-full">
            <h2>Password:</h2>
            <input class="input w-2/3 px-2" type="password" name="password" placeholder="Password..." />
            {#if form?.missing_password}<p class="text-red-600">Password is required</p>{/if}
            {#if form?.incorrect_password}<p class="text-red-600">Password is incorrect !</p>{/if}
        </div>
        <button class="btn variant-filled-primary mx-10 px-10" type="submit">Login</button>
    </form>
    <hr />
    <div class="flex flex-col gap-3 items-center">
        <a class="btn variant-filled mx-20 flex gap-4"><img class="h-[1em]" src="logo/42Paris.svg" alt="42 paris logo">Login with Intra</a>
        <a class="btn bg-white mx-20 flex gap-4"><img class="h-[1em]" src="logo/Google.svg" alt="Google logo">Login with Google</a>
    </div>
</main>