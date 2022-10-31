<script lang='ts'>
  import GarageListEntry from '$lib/components/GarageListEntry.svelte'
  import AppBarLayout from '$lib/layout/AppBarLayout.svelte'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps
</script>

<AppBarLayout error={data.error}>
    <p slot='content' class='text-gray-50 text-md italic'>Overview</p>

    {#if data.garages}
        <main class='flex gap-4 flex-col py-4 px-4'>
            {#each data.garages as garage}
                <GarageListEntry garage={garage} />
            {/each}
        </main>
    {/if}
</AppBarLayout>
