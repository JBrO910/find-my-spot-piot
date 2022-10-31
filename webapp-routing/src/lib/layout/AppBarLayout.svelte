<script>
    import Banner from '$lib/components/Banner.svelte'
    import TopBar from '$lib/components/TopBar.svelte'

    export let error
</script>

<div class='h-screen flex flex-col bg-gray-100'>
  <TopBar
    other='"'
    title='FindMySpot'
  >
    <slot
      name='content'
      slot='content'
    >
    </slot>
  </TopBar>

  {#if error}
    <Banner type='error' title={error.message} description={error.description} />
  {/if}

  <div class='h-screen overflow-y-auto'>
    <slot />
  </div>
</div>
