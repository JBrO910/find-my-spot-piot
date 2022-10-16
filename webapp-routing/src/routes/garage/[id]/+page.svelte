<script lang="ts">
  import SpotListEntry from '$lib/components/SpotListEntry.svelte'
  import AppBarLayout from '$lib/layout/AppBarLayout.svelte'
  import type { Garage, Spot } from '$lib/types'
    import io from 'socket.io-client'
    import { onMount } from 'svelte'

    export let data: {garage: Garage}

    let spots: Array<Spot> = []

    onMount(() => {
      if(!data.garage.id) return

      const socket = io(`ws://127.0.0.1:3000/${data.garage.id}`)
      socket.on("connect", () => console.log("Connected to socket"))
      socket.on("init", sendSpots => spots = sendSpots)
      socket.on("update", sendSpots => spots = sendSpots)
    })
</script>

<AppBarLayout>
    <p slot='content' class='text-gray-50 text-md italic'>{data?.garage?.name}</p>

    <div class='p-4'>
        <div class='grid grid-cols-6 gap-4 flex-col py-4 px-4'>
            {#each spots ?? [] as spot}
                <SpotListEntry spot={spot} />
            {/each}
        </div>
    </div>
</AppBarLayout>
