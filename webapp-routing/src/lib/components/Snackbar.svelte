<script lang='ts'>
  import { globalMessageState } from '$lib/stores.js'

  $: severityColors = $globalMessageState?.severity === 'error' ? 'bg-red-700 text-red-50' : $globalMessageState?.severity === 'warn' ? 'bg-yellow-700 text-yellow-50' : $globalMessageState?.severity === 'success' ? 'bg-green-700 text-green-50' : ''
  $: icon = $globalMessageState?.severity === 'error' ? '🛑' : $globalMessageState?.severity === 'warn' ? '⚠' : $globalMessageState?.severity === 'success' ? '🎉' : ''
  $: {
    if($globalMessageState?.duration) {
      setTimeout(() => {
        $globalMessageState = undefined
      }, $globalMessageState.duration)
    }
  }
</script>

{#if $globalMessageState}
  <div class={severityColors + ' rounded px-4 py-2 flex flex-col gap-2 absolute bottom-4 right-4 min-w-[200px]'}>
    <h6 class='text-lg font-medium'>{icon} {$globalMessageState.message}</h6>
    <p class='text-sm font-thin'>{$globalMessageState.description}</p>
  </div>
{/if}
