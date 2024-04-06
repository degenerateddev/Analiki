<script>
    import { enhance } from '$app/forms';

    export let form;    
</script>

<main class="container m-auto space-y-10">
    <form method="POST" use:enhance class="flex justify-center">
        <input type="text" name="query" class="w-1/3 rounded-full p-3 shadow-lg shadow-purple-500 bg-purple-600 text-white focus:outline-none" />
    </form>

    <div class="text-center bg-stone-800 text-white">
        {#if form?.missing}
            <p>Please enter a search query</p>
        {:else if form?.error}
            <p>{form.error}</p>
        {:else if form?.success}
            <pre class="text-left">
                {JSON.stringify(form?.data, null, 2)}
            </pre>
        {/if}
    </div>
</main>