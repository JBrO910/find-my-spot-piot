<script lang='ts'>
  import { globalMessageState } from '$lib/stores.js'
  import { fly } from 'svelte/transition'
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'

  $: severityColors = $globalMessageState?.severity === 'error'
                      ? 'bg-red-700 text-red-50'
                      : $globalMessageState?.severity === 'warn'
                        ? 'bg-yellow-700 text-yellow-50'
                        : $globalMessageState?.severity === 'success' ? 'bg-green-700 text-green-50' : ''
  $: icon = $globalMessageState?.severity === 'warn'
            ? WarnIcon
            : $globalMessageState?.severity === 'success'
              ? SuccessIcon
              : ErrorIcon
  $: {
    if ($globalMessageState?.duration) {
      setTimeout(() => {
        $globalMessageState = undefined
      }, $globalMessageState.duration)
    }
  }
</script>

<div class='absolute bottom-4 right-4 overflow-hidden'>
  {#if $globalMessageState && !$globalMessageState.isGlobal}
    <div
      transition:fly='{{ x: 200, duration: 500 }}'
      class={severityColors + ' rounded pl-4 pr-8 py-2 flex flex-col min-w-[200px]'}
    >
      <div class='flex gap-2 items-center'>
        <svelte:component this={icon} />
        <h6 class='text-lg font-medium'> {$globalMessageState.message}</h6>
      </div>
      <p class='text-sm font-thin'>{$globalMessageState.description}</p>
    </div>
  {/if}
</div>
