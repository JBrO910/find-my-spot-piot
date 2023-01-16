<script lang='ts'>
  import type { CombinedSpot } from '$lib/types.js'
  import BigIcon from '../icons/BigIcon.svelte'
  import CheckIcon from '../icons/CheckIcon.svelte'
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import GroupIcon from '../icons/GroupIcon.svelte'
  import PowerIcon from '../icons/PowerIcon.svelte'
  import SmallIcon from '../icons/SmallIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'

  export let editable = false
  export let spot: CombinedSpot | undefined

  $: gridLocationStyle = `grid-column: ${ spot?.x + 1 }; grid-row: ${ spot?.y + 1 };`
  $: spotStatus = spot?.isTurnedOff
                  ? [PowerIcon, 'text-red-700', 'Turned off']
                  : spot?.hasLostConnection
                    ? [ErrorIcon, 'text-red-700', 'Connection lost']
                    : spot?.hasNotChangedWarning
                      ? [WarnIcon, 'text-yellow-700', 'Occupied for a long time']
                      : [SuccessIcon, 'text-green-700', '']
  $: spotType = spot?.type === 'Family'
                ? GroupIcon
                : spot?.type === 'Small'
                  ? SmallIcon
                  : spot?.type === 'Wide'
                    ? BigIcon
                    : spot?.type === 'Accessible'
                      ? CheckIcon
                      : undefined
  $: spotDisplayStatus = spot?.isTurnedOff || spot?.hasLostConnection || spot?.hasNotChangedWarning
  $: statusClass = !!editable
                   ? 'bg-gray-600 hover:bg-gray-700'
                   : !spot
                     ? 'bg-gray-500'
                     : !!spotDisplayStatus || spot?.isTurnedOff
                       ? 'bg-red-700'
                       : !spot?.status
                         ? 'bg-orange-700'
                         : 'bg-green-700'
</script>

<div
  class='relative'
  on:click
  on:keydown
  style={gridLocationStyle}
>
  <div class={`${statusClass} flex justify-center items-center px-4 py-4 h-[100px] text-gray-50 outline outline-1 outline-gray-300`}>
    {spot?.id ?? ""}
  </div>

  {#if spotDisplayStatus}
    <div class='absolute top-0 right-0 bg-gray-50 dark:bg-gray-800 m-2 p-1 rounded'>
      <svelte:component
        this={spotStatus[0]}
        class={`${spotStatus[1]}`}
        title={spotStatus[2]}
      />
    </div>
  {/if}

  {#if spotType}
    <div class='absolute top-0 left-0 bg-gray-50 dark:bg-gray-800 m-2 p-1 rounded'>
      <svelte:component this={spotType} title={spot.type} />
    </div>
  {/if}
</div>
