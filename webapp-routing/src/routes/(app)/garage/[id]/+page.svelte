<!--suppress TypeScriptUnresolvedFunction -->
<script lang='ts'>
  import GarageLevelEntry from '$lib/components/GarageLevelEntry.svelte'
  import type { CombinedSpot, LiveSpot } from '$lib/types'
  import io from 'socket.io-client'
  import { onMount } from 'svelte'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps
  let selectedLevel = 0

  onMount(async () => {
    if (!data.garage?.id || !data.spots) {
      return
    }

    const socket = io(`ws://127.0.0.1:3000/${ data.garage.id }`)
    socket.on('connect', () => console.log('Connected to socket'))
    socket.on('update', (sendSpots: Array<LiveSpot>) => {
      sendSpots.forEach(({
                           id,
                           ...value
                         }) => {
        data.spots[id] = { ...data.spots[id], ...value }
      })
    })
  })

  const onSelectLevel = (level) => () => selectedLevel = level

  $: levels = Object.values(data?.spots ?? {})
    .reduce((acc: Array<Array<CombinedSpot>>, curr: CombinedSpot) => {
      if (!Array.isArray(acc[curr.z])) {
        acc[curr.z] = []
      }
      acc[curr.z].push(curr)
      return acc
    }, [])
</script>

<div class='flex gap-4 p-4'>
  {#each levels as level, i}
    <p
      on:click={onSelectLevel(i)}
      class='underline-offset-2 text-xl font-medium hover:cursor-pointer select-none'
      class:text-gray-900={selectedLevel === i}
      class:underline={selectedLevel === i}
      class:font-bold={selectedLevel === i}
      class:text-gray-700={selectedLevel !== i}
    >
      Level {i} <span class='text-base'>({level.filter(e => !!e.status).length}/{level.length})</span>
    </p>
  {/each}
</div>

<div class='p-4 flex flex-col gap-4'>
  {#if data.garage?.levelDescription}
    <GarageLevelEntry
      definition={data.garage.levelDescription[selectedLevel]}
      spots={levels[selectedLevel]}
    />
  {/if}
</div>