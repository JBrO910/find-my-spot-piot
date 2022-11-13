<script lang='ts'>
  import ErrorIcon from '../icons/ErrorIcon.svelte'
  import SuccessIcon from '../icons/SuccessIcon.svelte'
  import WarnIcon from '../icons/WarnIcon.svelte'

  export let type: 'error' | 'secondary' | 'success' = 'secondary'
  export let title: string
  export let description: string

  $: colorClasses = type === 'error'
                    ? 'bg-red-700 text-red-50'
                    : type === 'secondary'
                      ? 'bg-gray-700 text-gray-50'
                      : type === 'success'
                        ? 'bg-green-700 text-green-50'
                        : ''
  $: icon = type === 'warn'
            ? WarnIcon
            : type === 'success'
              ? SuccessIcon
              : ErrorIcon
</script>

<div class={`${colorClasses} rounded px-4 py-2 space-y-1 m-2`}>
  <div class='flex gap-2 items-center'>
    <svelte:component this={icon} />
    <h6 class='text-xl font-medium'>{title}</h6>
  </div>
  {#if description}
    <p class='text-xm'>{description}</p>
  {/if}
</div>
