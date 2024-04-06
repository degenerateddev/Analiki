<script>
    import { enhance } from '$app/forms';
    import Dot from '$lib/components/structure/Dot.svelte';

    export let form;
</script>

<main class="container m-auto space-y-10">
    <form method="POST" use:enhance class="flex justify-center">
        <input type="text" name="query" class="w-1/3 rounded-full p-3 shadow-lg shadow-purple-500 bg-purple-600 text-white focus:outline-none" />
    </form>

    <div class="flex justify-center">
        {#if form?.missing}
            <p>Please enter a search query</p>
        {:else if form?.error}
            <p>{form.error}</p>
        {:else if form?.success}
            <Dot {...form.data} />
        {/if}
    </div>
</main>