<script lang='ts'>
  import { enhance, applyAction } from '$app/forms'
  import { PUBLIC_BROKER_URL } from '$env/static/public'
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import io from 'socket.io-client'
  import { onMount } from 'svelte'
  import { putUserCard } from '../../../../lib/server/api'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps

  let selected = undefined
  let balance = 0

  let selectedCard = undefined
  let isLoadingCard = false
  let cardError = ''
  let loadingCardTimeout = undefined

  let socket = undefined

  const loadCard = () => {
    isLoadingCard = true
    socket?.emit('loadCard')
    loadingCardTimeout = setTimeout(() => {
      isLoadingCard = false
      cardError = 'Timeout'
    }, 10_000)
  }

  onMount(async () => {
    if (!data.page.user.adminGarageId && !data.page.user.isAdmin) {
      return
    }

    socket = io(`${ PUBLIC_BROKER_URL }/${ data.page.user.adminGarageId }-register`)
    socket.on('connect', () => console.log('Connected to socket'))
    socket.on('readCardResult', (card: { uid: string }) => {
      selectedCard = card.uid
      isLoadingCard = false
      clearTimeout(loadingCardTimeout)
    })
  })
</script>

<div class='grid place-items-center p-4'>
  <form
    class='bg-gray-50 rounded shadow p-4 w-[48rem] gap-2 flex flex-col'
    use:enhance={() => {
          isLoadingCard = true
          return async ({result}) => {
              isLoadingCard = false
              if(result.type === "invalid") {
                  cardError = result.data.error
                  return
              }
              await applyAction(result)
          }
      }}
  >
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
      name='balance'
      type='number'
    />
    <div class='flex items-center justify-between'>
      <input type='hidden' value='{selectedCard}' name='cardID'>
      {#if !!selectedCard}
        <span>Selected Card: {selectedCard}</span>
      {:else if isLoadingCard}
        <span>Loading...</span>
      {:else}
        <span>No card selected</span>
      {/if}
      <Button
        color='secondary'
        disabled={isLoadingCard}
        on:click={loadCard}
        type='button'
      >
        Read card
      </Button>
    </div>
    <Button
      disabled={!balance || !selected || !selectedCard}
      type='submit'
    >
      Write card to user
    </Button>
  </form>
</div>
