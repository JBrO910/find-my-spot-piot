<!--suppress ReservedWordAsName -->
<script lang="ts">
    import SpotListEntry from '$lib/components/SpotListEntry.svelte'
    import type { CombinedSpot } from '../types'

    export let spots: Array<Array<CombinedSpot>> = []
    export let definition: {x: Number, y: Number}

    $: cssGridDef = definition && `--count-cols: ${definition.x}; --count-rows: ${definition.y}`
</script>

<main>
    <div style={cssGridDef} class='gridDef grid rounded-xl p-2 border border-gray-300 bg-gray-500'>
        {#each spots as spot}
            <SpotListEntry {spot} />
        {/each}
    </div>
</main>

<!--suppress CssUnresolvedCustomProperty -->
<style>
    .gridDef {
        grid-template-columns : repeat(var(--count-cols, 10), 1fr);
        grid-template-rows    : repeat(var(--count-rows, 10), 1fr);
    }
</style>
