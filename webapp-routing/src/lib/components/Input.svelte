<script lang='ts'>
  export let placeholder: string
  export let id: string = 'input' + Math.random() * 10_000
  export let value: string = ''
  export let error: string = ''

  let isFocussed = false
  const onFocus = () => isFocussed = true
  const onBlur = () => isFocussed = false

  $: isRaised = isFocussed || !!value
  $: colorClasses = !!error ? 'border-red-300 ring-red-300' : 'border-gray-300'
  $: labelColor = !!error ? "text-red-400" : isRaised
                  ? isFocussed
                    ? 'text-blue-400'
                    : 'text-gray-400'
                  : 'text-opacity-60 text-gray-900'

  export let wrapperClass
</script>

<div class={wrapperClass + ' relative my-1'}>
  <label
    class={`${labelColor} absolute bg-gray-50 px-2 top-[.75rem] left-2 transition-transform pointer-events-none`}
    class:translate-y-[-1.4rem]={isRaised}
    for={id}
  >{placeholder}</label>
  <input
    {...$$restProps}
    bind:value={value}
    class={`${colorClasses} text-gray-900 border border-1 bg-transparent placeholder-opacity-60 focus:ring focus-visible:ring focus-visible:outline-none rounded py-3 px-3 w-full`}
    id={id}
    on:blur={onBlur}
    on:focus={onFocus}
  />
  {#if error}
    <small class='text-sm text-red-500'>{error}</small>
  {/if}
</div>
