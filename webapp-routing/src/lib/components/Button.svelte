<script lang='ts'>
  export let color: 'primary' | 'secondary' | 'error' = 'primary'
  export let disabled = false

  $: colorClasses = disabled
                    ? 'bg-gray-400 opacity-60'
                    : color === 'primary'
                      ? 'bg-blue-700 text-blue-50 hover:bg-blue-600 cursor-pointer'
                      : color === 'secondary'
                        ? 'bg-gray-700 text-gray-50 hover:bg-gray-600 cursor-pointer'
                        : color === 'error'
                          ? 'bg-red-700 text-red-50 hover:bg-red-600 cursor-pointer'
                          : ''
</script>

<button
  {...$$restProps}
  class={`${colorClasses} ${$$restProps.class ?? ""} focus:ring focus-visible:ring focus-visible:outline-none rounded py-1 px-2 text-lg font-medium flex gap-2 items-center`}
  disabled={disabled}
  on:click
>
  <slot name='iconLeft' />
  <slot />
</button>
