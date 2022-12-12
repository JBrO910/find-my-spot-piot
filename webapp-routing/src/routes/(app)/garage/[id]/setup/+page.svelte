<script lang='ts'>
  import { PUBLIC_BROKER_URL } from '$env/static/public'
  import Button from '$lib/components/Button.svelte'
  import GarageLevelEntry from '$lib/components/GarageLevelEntry.svelte'
  import Input from '$lib/components/Input.svelte'
  import TrashIcon from '$lib/icons/TrashIcon.svelte'
  import io from 'socket.io-client'
  import { onMount } from 'svelte'
  import type { PageLoadProps } from './types'
  import {goto} from "$app/navigation"

  const defaultRowsCols = {
    x: 3,
    y: 3,
  }
  export let data: PageLoadProps

  // TODO Redirect back if it is already set up

  let spots = []
  let gates = []
  let loadingSpots = false
  let selectedSpot = undefined

  let selectedLevel = 0
  const onSelectLevel = (level) => () => selectedLevel = level

  let socket = undefined
  let socketTimeout = undefined
  let socketError = ""

  let levelDescription = [
    { ...defaultRowsCols },
    { ...defaultRowsCols },
  ]
  const addLevel = () => {
    const levelCopy = [...levelDescription]
    levelCopy.push({ ...defaultRowsCols })
    levelDescription = levelCopy
  }
  const removeLevel = (index) => () => {
    const levelCopy = [...levelDescription]
    levelCopy.splice(index, 1)

    if (selectedLevel >= levelCopy.length) {
      selectedLevel = levelCopy.length - 1
    }

    levelDescription = levelCopy
  }

  const register = () => {
    socket.emit('register', { spots, levelDescription, gates: gates.filter(gate => gate.registered) })
    goto("/garage/" + data.garage?.id)
  }

  onMount(async () => {
    if (!data.garage?.id) {
      return
    }

    socket = io(`${ PUBLIC_BROKER_URL }/${ data.garage.id }-register`)
    socket.on('connect', () => console.log('Connected to socket'))

    socket.on('loadSpotsResponse', ({ spots: sendSpots, gates: sendGates }) => {
      loadingSpots = false
      spots = sendSpots.map(id => ({ id, type: "Normal" }))
      gates = sendGates.map(id => ({ id, registered: false }))
      clearTimeout(socketTimeout)
    })
  })

  const loadSpots = () => {
    if (!socket) {
      return
    }

    socketTimeout = setTimeout(() => {
      socketError = "Timed out"
      loadingSpots = false
    }, 15_000)

    loadingSpots = true
    socketError = ""
    socket.emit('loadSpots')
  }

  $: selectedLevelObject = levelDescription[selectedLevel]
  $: cssGridDef = selectedLevelObject && `--count-cols: ${ selectedLevelObject.x }; --count-rows: ${ selectedLevelObject.y }`
  $: filledSpotsAmount = spots.filter(spot => spot.x === undefined).length
  $: {
    spots = spots.map(spot => {
      if (spot.z !== selectedLevel) {
        return spot
      }

      if (spot.x >= selectedLevelObject.x || spot.y >= selectedLevelObject.y) {
        return { ...spot, x: undefined, y: undefined }
      }
      return spot
    })
  }
  $: mockSpots = Array.from({ length: selectedLevelObject.x * selectedLevelObject.y })
    .map((_, i) => {
      const x = i % selectedLevelObject.x
      const y = Math.floor(i / selectedLevelObject.x)
      const spot = spots.find((spot) => spot.x === x && spot.y === y && spot.z === selectedLevel)
      return spot ?? {
        x,
        y,
      }
    })
</script>

<div class='bg-gray-50 p-4 rounded mx-2 shadow mt-2'>
  <h6 class='text-xl font-semibold mb-2'>Level Definition</h6>
  <div class='flex gap-2'>
    <Input
      bind:value={selectedLevelObject.x}
      placeholder='Columns'
      type='number'
      min='1'
      wrapperClass='flex-1'
    />
    <Input
      bind:value={selectedLevelObject.y}
      placeholder='Rows'
      type='number'
      min='1'
      wrapperClass='flex-1'
    />
  </div>
  <h6 class='mt-2 font-semibold text-xl flex items-center gap-8'>
    Available Controllers
    {#if !spots.length}
      <Button
        class='text-sm'
        color='secondary'
        disabled={loadingSpots}
        on:click={loadSpots}
        on:keydown={loadSpots}
      >
        Load controllers
      </Button>
    {:else}
      <small class='ml-2 font-medium text-sm'>[{filledSpotsAmount}/{spots.length}]</small>
    {/if}
  </h6>
  <div class='overflow-x-auto max-w-full mx-2 mt-2'>
    <h6 class='text-lg font-medium'>Spots</h6>
    <div class='flex gap-2 py-1 mb-2'>
      {#each spots.filter(spot => spot.x === undefined) as spot}
        <p
          on:click={() => {selectedSpot = (selectedSpot === spot ? undefined : spot)}}
          on:keydown={() => {selectedSpot = (selectedSpot === spot ? undefined : spot)}}
          class={`px-2 py-1 whitespace-nowrap cursor-pointer select-none rounded ${selectedSpot === spot ? 'bg-blue-700 text-blue-50' : 'bg-gray-700 text-gray-50'}`}
        >
          {spot.id}
        </p>
      {:else}
        <small class='font-medium text-sm'>
          {#if loadingSpots && !socketError}
            Loading...
          {:else if socketError}
            {socketError}
          {:else}
            No more controllers were found
          {/if}
        </small>
      {/each}
    </div>
    <h6 class='text-lg font-medium'>Gates</h6>
    <div class='flex gap-2 py-1 mb-2'>
      {#each gates.filter(e => !e.registered) as gate}
        <p
          on:click={() => {gate.registered = true}}
          on:keydown={() => {gate.registered = true}}
          class={`px-2 py-1 whitespace-nowrap cursor-pointer select-none rounded bg-gray-700 text-gray-50`}
        >
          {gate.id}
        </p>
      {/each}
    </div>
  </div>
  <Button
    disabled={!!filledSpotsAmount || !spots.length}
    on:click={register}
    on:keydown={register}
  >
    Save Registration
  </Button>
</div>

<div>
  <h6 class='text-xl font-medium mr-2'>Gates:</h6>
  {#each gates.filter(e => e.registered) as gate}
    <p
      on:click={() => {gate.registered = false}}
      on:keydown={() => {gate.registered = false}}
      class={`px-2 py-1 whitespace-nowrap cursor-pointer select-none rounded bg-gray-700 text-gray-50`}
    >
      {gate.id}
    </p>
  {/each}
</div>

<div class='flex items-center gap-4 px-4 mt-4'>
  {#each levelDescription as level, i}
    <div class='flex items-center gap-2'>
      <p
        on:click={onSelectLevel(i)}
        on:keydown={onSelectLevel(i)}
        class='underline-offset-2 text-xl font-medium hover:cursor-pointer select-none'
        class:text-gray-900={selectedLevel === i}
        class:underline={selectedLevel === i}
        class:font-bold={selectedLevel === i}
        class:text-gray-700={selectedLevel !== i}
      >
        Level {i}
      </p>
      {#if selectedLevel === i && levelDescription.length > 1}
        <Button
          on:click={removeLevel(i)}
          on:keydown={removeLevel(i)}
          color='error'
          class='text-sm'
        >
          <div
            slot='iconLeft'
            class='w-[1.25em] h-[1.5em] grid place-items-center'
          >
            <TrashIcon />
          </div>
        </Button>
      {/if}
    </div>
  {/each}
  <Button
    class='text-sm'
    color='secondary'
    on:click={addLevel}
    on:keydown={addLevel}
  >
    Add level
  </Button>
</div>

<div class='p-4 flex flex-col gap-4'>
  <GarageLevelEntry
    definition={selectedLevelObject}
    editSpotClick={spot => {
        if(!selectedSpot) return !!spot?.id ? spot : undefined

        const oldIndex = spots.findIndex(nSpot => nSpot.x === spot.x && nSpot.y === spot.y && nSpot.z === selectedLevel)
        const index = spots.findIndex(nSpot => nSpot.id === selectedSpot.id)

        if(index !== -1) {
          spots[index].x = spot.x
          spots[index].y = spot.y
          spots[index].z = selectedLevel
        }
        if(oldIndex !== -1) {
          spots[oldIndex].x = undefined
          spots[oldIndex].y = undefined
        }

        selectedSpot = undefined
    }}
    editable
    isAdmin
    on:removeSpot={({detail: spot}) => {
        const index = spots.findIndex(nSpot => nSpot.id === spot.id)
        spots[index].x = undefined
        spots[index].y = undefined
    }}
    removable
    {socket}
    spots={mockSpots}
  />
</div>
