<!--suppress TypeScriptUnresolvedFunction -->
<script lang='ts'>
  import { goto } from '$app/navigation'
  import { PUBLIC_BROKER_URL } from '$env/static/public'
  import Button from '$lib/components/Button.svelte'
  import GarageLevelEntry from '$lib/components/GarageLevelEntry.svelte'
  import type { CombinedSpot, LiveSpot } from '$lib/types'
  import io from 'socket.io-client'
  import { onMount } from 'svelte'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps
  let selectedLevel = 0

  let socket = undefined

  const navigateToEdit = () => {
    goto(`/garage/${ data.garage?.id }/edit`)
  }

  onMount(async () => {
    if (!data.garage?.id || !data.spots) {
      return
    }

    socket = io(`${ PUBLIC_BROKER_URL }/${ data.garage.id }`, {
      auth: {
        token: `ApiKey ${ data.socketAuth }`,
      },
    })
    socket.on('connect', () => console.log('Connected to socket'))
    socket.on('update', (sendSpots: Array<LiveSpot>) => {
      sendSpots.forEach(({
                           id,
                           ...value
                         }) => {
        data.spots![id] = { ...data.spots![id], ...value }
      })
    })
  })

  const onSelectLevel = (level) => () => selectedLevel = level

  const openGate = (gate) => () => socket.emit('openGate', gate)

  $: levels = Object.values(data?.spots ?? {})
    .reduce((acc: Array<Array<CombinedSpot>>, curr: CombinedSpot) => {
      if (!Array.isArray(acc[curr.z])) {
        acc[curr.z] = []
      }
      acc[curr.z].push(curr)
      return acc
    }, [])

  $: gates = data?.garage?.gates ?? []
</script>

{#if data.page.user.isAdmin}
  <Button
    color='secondary'
    type='button'
    on:click={navigateToEdit}
    class='m-2'
  >Edit Garage
  </Button>

  <div class='pt-4 px-4'>
    <h6 class='text-xl font-medium mr-2'>Gates:</h6>
    <div class='flex gap-2'>
      {#if gates.length}
        {#each gates as gate}
          <p
            on:click={openGate(gate)}
            on:keydown={openGate(gate)}
            class={`px-2 py-1 whitespace-nowrap cursor-pointer select-none rounded bg-gray-700 text-gray-50`}
          >
            {gate}
          </p>
        {/each}
      {:else}
        <small class='font-medium text-sm'>
          No gates were registered on garage
        </small>
      {/if}
    </div>
  </div>
{/if}

<div class='flex gap-4 p-4'>
  {#each levels as level, i}
    <p
      on:click={onSelectLevel(i)}
      class='underline-offset-2 text-xl font-medium hover:cursor-pointer select-none'
      class:text-gray-900={selectedLevel === i}
      class:dark:text-gray-50={selectedLevel === i}
      class:underline={selectedLevel === i}
      class:font-bold={selectedLevel === i}
      class:text-gray-700={selectedLevel !== i}
      class:dark:text-gray-200={selectedLevel !== i}
    >
      Level {i} <span class='text-base'>({level.filter(e => !!e.status).length}/{level.length})</span>
    </p>
  {/each}
</div>

<div class='p-4 flex flex-col gap-4'>
  {#if data.garage?.levelDescription}
    <GarageLevelEntry
      isAdmin='{data.page.user.isAdmin}'
      definition={data.garage.levelDescription[selectedLevel]}
      spots={levels[selectedLevel]}
      {socket}
    />
  {/if}
</div>
