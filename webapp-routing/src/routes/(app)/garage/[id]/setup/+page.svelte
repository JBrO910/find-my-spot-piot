<script lang='ts'>
  import Button from '$lib/components/Button.svelte'
  import GarageLevelEntry from '$lib/components/GarageLevelEntry.svelte'
  import Input from '$lib/components/Input.svelte'
  import TrashIcon from '$lib/icons/TrashIcon.svelte'
  import io from 'socket.io-client'
  import { onMount } from 'svelte'
  import type { PageLoadProps } from './types'

  const defaultRowsCols = {
    x: 3,
    y: 3,
  }
  export let data: PageLoadProps

  let spots = {}

  let selectedLevel = 0
  const onSelectLevel = (level) => () => selectedLevel = level

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
    levelDescription = levelCopy
  }

  onMount(async () => {
    if (!data.garage?.id) {
      return
    }

    const socket = io(`ws://127.0.0.1:3000/${ data.garage.id }-register`)
    socket.on('connect', () => console.log('Connected to socket'))

    socket.on('loadSpotsResponse', (res: { spots: Array<string> }) => {
      spots = res.spots.reduce((acc: {}, curr: string) => {
        const id = curr.split('-')
          .shift()
        if (!(id in acc)) {
          acc[id] = []
        }
        acc[id].push(curr)
        return acc
      }, {})
    })

    socket.emit('loadSpots')
  })

  $: mockSpots = Array.from({length: levelDescription[selectedLevel].x * levelDescription[selectedLevel].y}).map((_, i) => ({
    x: i % levelDescription[selectedLevel].x,
    y: Math.floor(i / levelDescription[selectedLevel].x)
  }))
  $: cssGridDef = levelDescription[selectedLevel] && `--count-cols: ${levelDescription[selectedLevel].x}; --count-rows: ${levelDescription[selectedLevel].y}`
</script>

<div class='flex items-center gap-4 p-4'>
  {#each levelDescription as level, i}
    <div class='flex items-center gap-2'>
      <p
        on:click={onSelectLevel(i)}
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
          color='error'
        >
          <div slot='iconLeft' class='w-[1.25em] h-[1.5em] grid place-items-center'>
            <TrashIcon />
          </div>
        </Button>
      {/if}
    </div>
  {/each}
  <Button on:click={addLevel}>Add level</Button>
</div>

<div class='bg-gray-50 px-4 py-2 rounded mx-2 shadow flex gap-2'>
  <Input placeholder='Rows' wrapperClass='flex-1' bind:value={levelDescription[selectedLevel].x} type='number'/>
  <Input placeholder='Columns' wrapperClass='flex-1' bind:value={levelDescription[selectedLevel].y} type='number'/>
</div>

<div class='p-4 flex flex-col gap-4'>
  <GarageLevelEntry
    definition={levelDescription[selectedLevel]}
    spots={mockSpots}
    editable
  />
</div>

<!--suppress CssUnresolvedCustomProperty -->
<style>
    .gridDef {
        grid-template-columns : repeat(var(--count-cols, 10), 1fr);
        grid-template-rows    : repeat(var(--count-rows, 10), 1fr);
    }
</style>
