<script lang='ts'>
  import { enhance } from '$app/forms'
  import Button from '$lib/components/Button.svelte'
  import type { PageLoadProps } from './types'

  export let data: PageLoadProps

  $: amountOwed = data.parkingHistory?.filter(e => e.status === 'unpaid')
    ?.reduce((acc, curr) => acc + +curr.totalCost, 0) ?? 0
</script>

<div class='flex flex-col gap-4 p-4'>
  <form
    action='?/topUp'
    class='bg-gray-50 rounded shadow px-4 py-2 flex items-center justify-between'
    use:enhance
  >
    <h6 class='text-xl font-semibold'>
      Your status
    </h6>

    <h6 class='text-lg'>Current balance is <strong>{data.page.user.balance?.toFixed(2)}€</strong> and you owe
      <strong>{amountOwed.toFixed(2)}€</strong></h6>

    <div class='flex gap-2 items-center'>
      <strong class='mr-2'>Top up:</strong>
      <Button
        color='secondary'
        name='amount'
        value='5'
      >+ 5€
      </Button>
      <Button
        color='secondary'
        name='amount'
        value='10'
      >+ 10€
      </Button>
      <Button
        color='secondary'
        name='amount'
        value='25'
      >+ 25€
      </Button>
    </div>
  </form>

  {#each data.parkingHistory as parkingSession}
    <div
      class='bg-gray-50 rounded shadow flex-1 px-4 py-2 flex items-center justify-between border'
      class:border-red-700={parkingSession.status === "unpaid"}
      class:border-blue-700={parkingSession.status === "open"}
      class:border-green-700={parkingSession.status === "closed"}
    >
      <div class='flex flex-col gap-2'>
        {#if parkingSession.status !== "open"}
          <div>
            Parked on <strong>{new Date(parkingSession.startTime).toLocaleDateString()}</strong> in garage
            <strong>{parkingSession.garage.name}</strong>
          </div>

          <div>
            <h6 class='text-xl font-medium'>
              Cost: {parseFloat(parkingSession.totalCost)
                .toFixed(2)}€
            </h6>
            <span
              class='text-sm font-medium'
              class:text-red-700={parkingSession.status === "unpaid"}
            >
              {parkingSession.payedOn ? "Payed on: " + new Date(parkingSession.payedOn).toLocaleDateString()
                                      : "Did not pay yet"}
            </span>
          </div>
        {:else}
          <div>
            Currently parking in garage
            <strong>{parkingSession.garage.name}</strong> since
            <strong>{new Date(parkingSession.startTime).toLocaleString()}</strong>
          </div>
        {/if}
      </div>

      <form
        class='flex flex-col gap-2 items-end'
        use:enhance
        action='?/pay'
      >
        <input
          type='hidden'
          bind:value={parkingSession.id}
          name='sessionId'
          id='sessionId'
        />
        {#if parkingSession.status === "unpaid"}
          <Button
            color='secondary'
            disabled='{data.page.user?.balance < parkingSession.totalCost}'
          >
            Pay now
          </Button>
          {#if data.page.user?.balance < parkingSession.totalCost}
            <small class='text-sm text-red-700 font-medium'>Not enough balance</small>
          {/if}
        {/if}
      </form>
    </div>
  {/each}
</div>
