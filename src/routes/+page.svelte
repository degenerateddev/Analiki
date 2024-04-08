<script>
    import { enhance } from '$app/forms';
    import Dot from '$lib/components/structure/Dot.svelte';

    export let form;

    // json object
    let main;
    // format: { 0: {}, 1. {}, 2. {}, 3. {}, ... }
    let furtherGenerations = {

    };

    $: {
        if (form?.article) {
            main = form.article;
        }
    }

    let isLoading = false;
</script>

<main class="container m-auto space-y-10">
    <form action="?/get" method="POST" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
        isLoading = true;

        return async ({ result, update }) => {
            if (result) {
                furtherGenerations = {};

                update(result);
                isLoading = false;
            }
        }
    }}>
        <div class="flex justify-center">
            <input type="text" name="query" class="w-1/3 rounded-full p-3 shadow-lg shadow-purple-500 bg-purple-600 text-white focus:outline-none" />
        </div>
    </form>

    {#if isLoading}
        <div class="flex justify-center">
            <p>Loading...</p>
        </div>
    {:else}
        <div class="flex justify-center">
            {#if form?.missing}
                <p>Please enter a search query</p>
            {:else if form?.articles_missing}
                <p>No articles found</p>
            {:else if form?.error}
                <p>{form.error}</p>
            {/if}
        </div>
    {/if}
    
    <div class="flex flex-col justify-center items-center space-y-10">
        {#if main}
            <Dot title={main.title} text={main.text} links={main.links} iwlinks={main.iwlinks} sources={main.sources} />

            {#each Object.keys(furtherGenerations) as key}
                <h2>Generation No.: {parseInt(key) + 1}</h2>
                <div class="flex gap-5 w-[80vw] flex-wrap">
                    {#each furtherGenerations[key] as article}
                        <Dot sizeAmplifier={0.5} title={article.title} text={article.text} links={article.links} iwlinks={article.iwlinks} sources={article.sources} />
                    {/each}
                </div>
            {/each}
        
            <form action="?/crawl" method="POST" use:enhance={
                ({ formElement, formData, action, cancel, submitter }) => {
                    isLoading = true;
    
                    return async ({ result, update }) => {
                        if (result) {
                            const articles = result.data.articles;
                            furtherGenerations[Object.keys(furtherGenerations).length] = articles;

                            update(result);
                            isLoading = false;
                        }
                    }
                }
            }>
                {#if main.links.length > 0}
                    <input type="hidden" name="articles" value={Object.keys(furtherGenerations).length > 0 ? 
                        [...new Set(furtherGenerations[Object.keys(furtherGenerations).length - 1].map(article => article.links.join(",")))] 
                        : 
                        [...new Set(main.links.join(",").split(","))]}
                    />
                    <button type="submit">
                        {#if isLoading}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="animate-spin w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>                          
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="animate-bounce w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
                            </svg>
                        {/if}
                    </button>
                {/if}
            </form>
        {/if}
    </div>
</main>