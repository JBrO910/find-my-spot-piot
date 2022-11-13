<script lang='ts'>
  import type { CombinedSpot } from '$lib/types.js'
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'

  export let editable = false
  export let spot: CombinedSpot | undefined

  $: gridLocationStyle = `grid-column: ${ spot?.x + 1 }; grid-row: ${ spot?.y + 1 };`
  $: spotStatus = spot?.hasLostConnection
                  ? [ErrorIcon, 'text-red-700', 'Connection lost']
                  : spot?.hasNotChangedWarning
                    ? [WarnIcon, 'text-yellow-700', 'Occupied for a long time']
                    : [SuccessIcon, 'text-green-700', '']
  $: spotDisplayStatus = spot?.hasLostConnection || spot?.hasNotChangedWarning
  $: statusClass = !!editable
                   ? 'bg-gray-600 hover:bg-gray-700'
                   : !spot
                     ? 'bg-gray-500'
                     : !!spotDisplayStatus
                       ? 'bg-red-700'
                       : !spot?.status
                         ? 'bg-orange-700'
                         : 'bg-green-700'
</script>

<div
  class='relative'
  on:click
  style={gridLocationStyle}
>
  <div class={statusClass + ' flex justify-center items-center px-4 py-4 h-[100px] text-green-50 outline outline-1 outline-gray-300'}>
    {spot?.id ?? ""}
  </div>

  {#if spotDisplayStatus}
    <div class='absolute top-0 right-0 bg-gray-50 m-2 p-1 rounded'>
      <svelte:component
        this={spotStatus[0]}
        class={`${spotStatus[1]}`}
        title={spotStatus[2]}
      />
    </div>
  {/if}
</div>
