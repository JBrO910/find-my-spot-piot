<!--suppress ReservedWordAsName -->
<script lang='ts'>
  import Button from '$lib/components/Button.svelte'
  import SpotListEntry from '$lib/components/SpotListEntry.svelte'
  import type { Socket } from 'socket.io-client'
  import { createEventDispatcher, onMount } from 'svelte'
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'
  import type { CombinedSpot } from '../types'

  const dispatch = createEventDispatcher()

  export let socket: Socket | undefined = undefined
  let isSocketSetup = false

  export let editable = false
  export let editSpotClick: (mockSpot: any) => CombinedSpot = undefined
  export let removable = false
  export let spots: Array<CombinedSpot> = []
  export let definition: { x: Number, y: Number }

  let selectedSpot: CombinedSpot | undefined = undefined

  let measurementTimeout = undefined
  let measurement = {}

  const measureSpot = (spot) => () => {
    measurement[spot.id] = "Loading..."
    measurementTimeout = setTimeout(() => {
      measurement[spot.id] = "Timeout"
    }, 5000)
    socket?.emit("measure", spot.id)
  }

  const blinkSpot = (spot) => () => {
    socket?.emit("blink", spot.id)
  }

  let referenceTime = new Date()
  onMount(() => {
    const interval = setInterval(() => {
      referenceTime = new Date()
    }, 1000 * 60)

    return () => {
      clearInterval(interval)
    }
  })

  const onClickSpot = (spot) => () => {
    if (!!editSpotClick) {
      spot = editSpotClick(spot)
    }
    selectedSpot = spot
  }

  const onEscape = (e) => {
    if (e.code !== 'Escape') {
      return
    }
    selectedSpot = undefined
  }

  $: {
    if(!!socket && !isSocketSetup) {
      isSocketSetup = true
      socket?.on("measureResult", ({measure, id}) => {
        clearTimeout(measurementTimeout)

        if(id !== selectedSpot?.id) return;

        measurement[id] = measure
      })
    }
  }

  $: cssGridDef = definition && `--count-cols: ${ definition.x }; --count-rows: ${ definition.y }`
  $: parkedFor = [
    (referenceTime.getTime() - selectedSpot?.statusChangedAt) / 1000 / 60 / 60,
    ((referenceTime.getTime() - selectedSpot?.statusChangedAt) / 1000 / 60) % 60,
  ].map(e => Math.abs(Math.floor(e)))
  $: spotDisabled = selectedSpot?.hasLostConnection || selectedSpot?.hasNotChangedWarning
  $: spotStatus = selectedSpot?.hasLostConnection
                  ? [ErrorIcon, 'text-red-700', 'Connection lost']
                  : selectedSpot?.hasNotChangedWarning
                    ? [WarnIcon, 'text-yellow-700', 'Occupied for a long time']
                    : [SuccessIcon, 'text-green-700', '']
</script>

<div
  class='focus-visible:outline-none'
  on:keydown={onEscape}
  tabindex='0'
>
  <div
    class='gridDef grid rounded-xl p-2 border border-gray-300 bg-gray-500'
    style={cssGridDef}
  >
    {#each spots as spot}
      <SpotListEntry
        {spot}
        {editable}
        on:click={onClickSpot(spot)}
        on:keydown={onClickSpot(spot)}
      />
    {/each}
  </div>

  {#if selectedSpot}
    <div
      class='z-10 absolute inset-0 p-[64px] grid place-items-center bg-gray-600/[.6]'
      on:click={() => (selectedSpot = undefined)}
      on:keydown={() => (selectedSpot = undefined)}
    >
      <div
        class='bg-gray-50 p-4 rounded-md shadow-md flex flex-col gap-2'
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div class='flex gap-1 items-center'>
          <h5 class='text-2xl font-semibold'>{selectedSpot.id ?? 'Empty spot'}</h5>
          {#if spotStatus[2]}
            <svelte:component
              class={`${spotStatus[1]} text-2xl ml-2`}
              this={spotStatus[0]}
              title={spotStatus[2]}
            />
            <span class='text-red-700 text-sm font-medium'>{spotStatus[2]}</span>
          {/if}
        </div>

        <div class='flex gap-2 items-center'>
          {#if removable}
            <Button
              disabled={spotDisabled || !selectedSpot.id}
              color='error'
              on:click={() => {
                  dispatch("removeSpot", selectedSpot)
                  selectedSpot = undefined
              }}
            >Remove
            </Button>
          {/if}
<!--          <Button disabled={spotDisabled || !selectedSpot.id}>Turn off</Button>-->
          <Button disabled={spotDisabled || !selectedSpot.id} on:click={blinkSpot(selectedSpot)}>Signal</Button>
          <Button disabled={spotDisabled || !selectedSpot.id || measurement[selectedSpot.id] === "Loading..."} on:click={measureSpot(selectedSpot)}>Measure</Button>
          <small class='text-sm font-medium min-w-[24ch]'>
            {#if measurement[selectedSpot?.id] !== undefined}
              Result: {measurement[selectedSpot?.id].toFixed(3)} mm
            {:else}
              Result: No measurement
            {/if}
          </small>
        </div>

        {#if !editable}
          <h6 class='text-lg font-semibold mt-2'>
            Information
          </h6>
          <table class='text-left'>
            <tr>
              <th class='key'>{!!selectedSpot?.status ? "Free for" : "Parked for"}</th>
              <td class='value'>{parkedFor[0]} H {parkedFor[1]} mins</td>
            </tr>
            <tr>
              <th class='key'>Last updated at</th>
              <td class='value'>{new Date(selectedSpot.statusChangedAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th class='key'>Last keep alive</th>
              <td class='value'>{new Date(selectedSpot.lastKeepAlive).toLocaleString()}</td>
            </tr>
          </table>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!--suppress CssUnresolvedCustomProperty -->
<style>
    .gridDef {
        grid-template-columns : repeat(var(--count-cols, 10), 1fr);
        grid-template-rows    : repeat(var(--count-rows, 10), 1fr);
    }

    tr:nth-child(odd) {
        @apply bg-gray-200
    }

    tr:nth-child(even) {
        @apply bg-gray-300
    }

    th, td {
        @apply p-1
    }

    .key {
        @apply text-gray-900 text-sm font-bold whitespace-nowrap
    }

    .value {
        @apply text-gray-700 text-sm whitespace-nowrap
    }
</style>
