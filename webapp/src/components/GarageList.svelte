<script>
    import { onMount } from 'svelte'
    import { getGarageOverview } from '../lib/api.js'
    import GarageListEntry from './GarageListEntry.svelte'

    let garages = []

    onMount(async () => {
        garages = await getGarageOverview()
    })
</script>

<main class='flex gap-4 flex-col py-4 px-4'>
    {#each garages as garage}
        <GarageListEntry garage={garage} />
    {/each}
</main>
