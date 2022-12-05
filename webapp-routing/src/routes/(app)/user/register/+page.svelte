<script lang='ts'>
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps

  let selected = undefined
  let balance = 0

  let selectedCard = undefined
  let isLoadingCard = false
  let loadingCardTimeout = undefined
</script>

<div class='grid place-items-center p-4'>
  <div class='bg-gray-50 rounded shadow p-4 w-[48rem] gap-2 flex flex-col'>
    <h6 class='text-xl font-medium mb-2'>Register user cards</h6>
    <Input
      bind:value={selected}
      placeholder='User'
      selectOptions={data?.users?.map(e => ({label: e.username, value: e.id}))}
      type='select'
    />
    <Input
      bind:value={balance}
      placeholder='Balance'
      type='number'
    />
    <div class='flex items-center justify-between'>
      {#if !!selectedCard}
        <span>Selected Card: {selectedCard}</span>
      {:else}
        <span>No card selected</span>
      {/if}
      <Button
        color='secondary'
        disabled={isLoadingCard}
      >
        Read card
      </Button>
    </div>
    <Button disabled={!balance || !selected || !selectedCard}>Write card to user</Button>
  </div>
</div>
