<script lang='ts'>
  export let placeholder: string
  export let id: string = 'input' + Math.random() * 10_000
  export let value: string
  export let error: string = ''
  export let selectOptions: Array<string> = []

  let isFocussed = false
  const onFocus = () => isFocussed = true
  const onBlur = () => isFocussed = false

  $: isRaised = isFocussed || value !== undefined
  $: colorClasses = !!error ? 'border-red-300 ring-red-300' : 'border-gray-300 dark:border-gray-500'
  $: labelColor = !!error ? 'text-red-400' : isRaised
                                             ? isFocussed
                                               ? 'text-orange-400'
                                               : 'text-gray-400 dark:text-gray-500'
                                             : 'text-opacity-60 text-gray-900 dark:text-gray-500'

  export let wrapperClass
</script>

<div class={wrapperClass + ' relative my-1'}>
  <label
    class={`${labelColor} absolute bg-gray-50 dark:bg-gray-800 px-2 top-[.75rem] left-2 transition-transform pointer-events-none`}
    class:translate-y-[-1.5rem]={isRaised}
    for={id}
  >
    {placeholder}
  </label>
  {#if $$restProps.type !== 'select'}
    <input
      id={id}
      class={`${colorClasses} text-gray-900 dark:text-gray-50 border border-1 bg-transparent placeholder-opacity-60 disabled:text-opacity-60 focus:ring focus-visible:ring focus-visible:outline-none rounded py-3 px-3 w-full`}
      bind:value={value}
      on:blur={onBlur}
      on:focus={onFocus}
      {...$$restProps}
    />
  {:else}
    <select
      name='test'
      id='test'
      class={`${colorClasses} text-gray-900 dark:text-gray-50 border border-1 bg-transparent placeholder-opacity-60 focus:ring focus-visible:ring focus-visible:outline-none rounded py-3 px-3 w-full`}
      bind:value={value}
      on:blur={onBlur}
      on:focus={onFocus}
      {...$$restProps}
    >
      {#each selectOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {/if}
  {#if error}
    <small class='text-sm text-red-500'>{error}</small>
  {/if}
</div>
