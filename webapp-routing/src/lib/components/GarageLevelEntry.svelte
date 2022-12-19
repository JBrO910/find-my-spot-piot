<!--suppress ReservedWordAsName -->
<script lang='ts'>
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import SpotListEntry from '$lib/components/SpotListEntry.svelte'
  import type { Socket } from 'socket.io-client'
  import { createEventDispatcher, onMount } from 'svelte'
  import BigIcon from '../icons/BigIcon.svelte'
  import CheckIcon from '../icons/CheckIcon.svelte'
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import GroupIcon from '../icons/GroupIcon.svelte'
  import SmallIcon from '../icons/SmallIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'
  import type { CombinedSpot } from '../types'

  const dispatch = createEventDispatcher()

  export let socket: Socket | undefined = undefined
  let isSocketSetup = false

  export let editable = false
  export let isAdmin = false
  export let editSpotClick: (mockSpot: any) => CombinedSpot = undefined
  export let removable = false
  export let spots: Array<CombinedSpot> = []
  export let definition: { x: Number, y: Number }

  let selectedSpotIndex: number | undefined = undefined

  let measurementTimeout = undefined
  let measurement = {}

  const measureSpot = (spot) => () => {
    measurement[spot.id] = 'Loading...'
    measurementTimeout = setTimeout(() => {
      measurement[spot.id] = 'Timeout'
    }, 5000)
    socket?.emit('measure', spot.id)
  }

  const blinkSpot = (spot) => () => {
    socket?.emit('blink', spot.id)
  }

  const turnSpotPower = (spot, turnOff) => () => {
    const event = turnOff ? 'turnOff' : 'turnOn'
    socket?.emit(event, spot.id)
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
    if (!spot) {
      return
    }

    selectedSpotIndex = spots.findIndex(e => e.id === spot.id)
  }

  const onEscape = (e) => {
    if (e.code !== 'Escape') {
      return
    }
    selectedSpotIndex = undefined
  }

  $: {
    if (!!socket && !isSocketSetup) {
      isSocketSetup = true
      socket?.on(
        'measureResult', ({
                            measure,
                            id,
                          }) => {
          clearTimeout(measurementTimeout)

          if (id !== spots[selectedSpotIndex]?.id) {
            return
          }

          measurement[id] = `${ measure.toFixed(3) } cm`
        })
    }
  }

  $: cssGridDef = definition && `--count-cols: ${ definition.x }; --count-rows: ${ definition.y }`
  $: parkedFor = [
    (referenceTime.getTime() - spots[selectedSpotIndex]?.statusChangedAt) / 1000 / 60 / 60,
    ((referenceTime.getTime() - spots[selectedSpotIndex]?.statusChangedAt) / 1000 / 60) % 60,
  ].map(e => Math.abs(Math.floor(e)))
  $: spotDisabled = spots[selectedSpotIndex]?.isTurnedOff || spots[selectedSpotIndex]?.hasLostConnection
  $: spotStatus = spots[selectedSpotIndex]?.isTurnedOff
                  ? [ErrorIcon, 'text-red-700', 'Turned off']
                  : spots[selectedSpotIndex]?.hasLostConnection
                    ? [ErrorIcon, 'text-red-700', 'Connection lost']
                    : spots[selectedSpotIndex]?.hasNotChangedWarning
                      ? [WarnIcon, 'text-yellow-700', 'Occupied for a long time']
                      : [SuccessIcon, 'text-green-700', '']
  $: spotType = spots[selectedSpotIndex]?.type === 'Family'
                ? GroupIcon
                : spots[selectedSpotIndex]?.type === 'Small'
                  ? SmallIcon
                  : spots[selectedSpotIndex]?.type === 'Wide'
                    ? BigIcon
                    : spots[selectedSpotIndex]?.type === 'Accessible'
                      ? CheckIcon
                      : undefined
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

  {#if spots[selectedSpotIndex]}
    <div
      class='z-10 absolute inset-0 p-[64px] grid place-items-center bg-gray-600/[.6]'
      on:click={() => (selectedSpotIndex = undefined)}
      on:keydown={() => (selectedSpotIndex = undefined)}
    >
      <div
        class='bg-gray-50 p-4 rounded-md shadow-md flex flex-col gap-2'
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div class='flex gap-2 items-center'>
          {#if spotType}
            <svelte:component
              class='text-2xl ml-2'
              this={spotType}
              title={spots[selectedSpotIndex].type}
            />
          {/if}
          <h5 class='text-2xl font-semibold'>{spots[selectedSpotIndex].id ?? 'Empty spot'}</h5>
          {#if spotStatus[2]}
            <svelte:component
              class={`${spotStatus[1]} text-2xl ml-2`}
              this={spotStatus[0]}
              title={spotStatus[2]}
            />
            <span class='text-red-700 text-sm font-medium'>{spotStatus[2]}</span>
          {/if}
          {#if editable}
            <Input
              bind:value={spots[selectedSpotIndex].type}
              id='type'
              name='type'
              placeholder='Type'
              wrapperClass='ml-2'
              required
              type='select'
              selectOptions={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Accessible', label: 'Accessible' },
                { value: 'Wide', label: 'Wide' },
                { value: 'Small', label: 'Small' },
                { value: 'Family', label: 'Family' },
              ]}
            />
          {/if}
        </div>

        <div class='flex gap-2 items-center'>
          {#if removable}
            <Button
              disabled={spotDisabled || !spots[selectedSpotIndex].id}
              color='error'
              on:click={() => {
                  dispatch("removeSpot", spots[selectedSpotIndex])
                  selectedSpotIndex = undefined
              }}
            >
              Remove
            </Button>
          {/if}
          {#if !editable && isAdmin}
            {#if !spots[selectedSpotIndex].isTurnedOff}
              <Button
                on:click={turnSpotPower(spots[selectedSpotIndex], true)}
                disabled={spotDisabled || !spots[selectedSpotIndex].id}
                color='error'
              >
                Turn off
              </Button>
            {:else}
              <Button
                on:click={turnSpotPower(spots[selectedSpotIndex], false)}
                color='error'
              >
                Turn on
              </Button>
            {/if}
          {/if}
            <Button
              disabled={spotDisabled || !spots[selectedSpotIndex].id || spots[selectedSpotIndex].isTurnedOff}
              on:click={blinkSpot(spots[selectedSpotIndex])}
            >
              Signal
            </Button>
            {#if isAdmin}
            <Button
              disabled={spotDisabled || !spots[selectedSpotIndex].id || measurement[spots[selectedSpotIndex].id] === "Loading..." || spots[selectedSpotIndex].isTurnedOff}
              on:click={measureSpot(spots[selectedSpotIndex])}
            >
              Measure
            </Button>
            <small class='text-sm font-medium min-w-[24ch]'>
              {#if measurement[spots[selectedSpotIndex]?.id] !== undefined}
                Result: {measurement[spots[selectedSpotIndex]?.id]}
              {:else}
                Result: No measurement
              {/if}
            </small>
          {/if}
        </div>

        {#if !editable && !spots[selectedSpotIndex].isTurnedOff}
          <h6 class='text-lg font-semibold mt-2'>
            Information
          </h6>
          <table class='text-left'>
            <tr>
              <th class='key'>{!!spots[selectedSpotIndex]?.status ? "Free for" : "Parked for"}</th>
              <td class='value'>{parkedFor[0]} H {parkedFor[1]} mins</td>
            </tr>
            <tr>
              <th class='key'>Last updated at</th>
              <td class='value'>{new Date(spots[selectedSpotIndex].statusChangedAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th class='key'>Last keep alive</th>
              <td class='value'>{new Date(spots[selectedSpotIndex].lastKeepAlive).toLocaleString()}</td>
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
