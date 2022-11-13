<script lang='ts'>
  import GarageListEntry from '../../lib/components/GarageListEntry.svelte'
  import type { PageLoadProps } from '../types'

  export let data: PageLoadProps
</script>

<div class='flex flex-col gap-2 p-4'>
  {#if data.garages}
    <main class='flex gap-4 flex-col'>
      {#each data.garages as garage}
        <GarageListEntry garage={garage} />
      {/each}
    </main>
  {/if}
</div>
