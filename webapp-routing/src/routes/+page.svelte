<script lang='ts'>
  import GarageListEntry from '$lib/components/GarageListEntry.svelte'
  import AppBarLayout from '$lib/layout/AppBarLayout.svelte'
  import type { GarageOverview } from '../lib/types'

  export let data: { garages: Array<GarageOverview> }
</script>

<AppBarLayout>
    <p slot='content' class='text-gray-50 text-md italic'>Overview</p>

    <main class='flex gap-4 flex-col py-4 px-4'>
        {#each data?.garages ?? [] as garage}
            <GarageListEntry garage={garage} />
        {/each}
    </main>
</AppBarLayout>
