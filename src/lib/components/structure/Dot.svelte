<script>
    export let title = "";
    export let text = "";
    export let links = [];
    export let iwlinks = [];
    export let sources = [];

    let showContent = false;

    function stopPropagation(event) {
        event.stopPropagation();
    }
</script>

<button class="relative inline-block rounded-full bg-purple-400 p-6" on:click={() => showContent = !showContent}>
    <div class="absolute inset-0 rounded-full translate-x-2 translate-y-2 blur" />
    <div class="relative flex items-center text-center justify-center w-24 h-24 text-sm translate-y-1">
        {title}
    </div>
</button>

{#if showContent}
    <div class="absolute inset-0 p-10 bg-purple-900 bg-opacity-50" on:click={() => showContent = !showContent}>
        <div class="flex justify-center">
            <table class="text-center table-auto space-x-4">
                <thead>
                    <tr>
                        <th class="px-4">Links</th>
                        <th class="px-4">IWLinks</th>
                        <th class="px-4">Sources</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="px-4">{links.length}</td>
                        <td class="px-4">{iwlinks.length}</td>
                        <td class="px-4">{sources.length}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-center">
            <div class="relative w-[50vw] bg-white overflow-y-scroll" on:click={stopPropagation}>
                {@html text}
            </div>
        </div>
    </div>
{/if}