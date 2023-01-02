<script lang='ts'>
  import { applyAction, enhance } from '$app/forms'
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { ApiError, Garage } from '$lib/types'
  import { onMount } from 'svelte'

  export let data: { garage: Garage }

  let isOpen24HoursWorkdays = false
  let isOpen24HoursWeekends = false

  let error: ApiError | undefined = undefined
  let message: string | undefined = undefined

  onMount(() => {
    isOpen24HoursWorkdays = !data.garage.openingHoursWorkdays
    isOpen24HoursWeekends = !data.garage.openingHoursWeekend
  })
</script>

{#if !data.garage}
  <h6 class='p-8 font-2xl text-red-700 font-medium'>Garage was not found</h6>
{:else}
  <div class='flex flex-col items-center justify-center gap-2 p-4'>
    <div class='rounded bg-gray-50 shadow px-4 py-2 w-1/2'>
      <h6 class='text-2xl font-medium'>Edit Garage "{data.garage.name}"</h6>

      <div class='flex flex-col gap-1 mt-1'>
        <p class='text-lg font-medium'>{data.garage.address}</p>
        <p class='text-lg font-medium'>{data.garage.phoneNumber}</p>
      </div>

      <form
        class='flex flex-col gap-4 py-4'
        use:enhance={() => {
          error = undefined
          message = undefined
          return async ({result}) => {
              if(result.type === "invalid") {
                  error = result.data.error
                  return
              }
              message = "Garage was updated successfully"
              await applyAction(result)
          }
      }}
      >
        <input
          type='hidden'
          name='id'
          value='{data.garage.id}'
        >

        <h6 class='text-lg font-medium'>Settings</h6>

        <div class='flex flex-col gap-2'>
          <h6 class='font-medium'>Opening Times</h6>

          <Input
            id='sleepTime'
            name='sleepTime'
            placeholder='Time between status checks in seconds'
            type='number'
            value='{data.garage.sleepTime}'
            wrapperClass='flex-1'
          />

          <h6 class='text-sm font-medium'>Workdays</h6>
          <div class='flex gap-2 items-center'>
            <label class='mr-2'>
              <input
                bind:checked={isOpen24HoursWorkdays}
                id='isOpen24HoursWorkdays'
                name='isOpen24HoursWorkdays'
                type='checkbox'
              />
              Is Open 24 Hours
            </label>
            <Input
              bind:disabled={isOpen24HoursWorkdays}
              id='openFromWorkdays'
              name='openFromWorkdays'
              value='{data.garage.openingHoursWorkdays?.[0]}'
              on:change={(e) => isOpen24HoursWorkdays = e.target.checked}
              placeholder='Open From'
              required={!isOpen24HoursWorkdays}
              type='time'
              wrapperClass='flex-1'
            />
            <Input
              bind:disabled={isOpen24HoursWorkdays}
              id='openToWorkdays'
              name='openToWorkdays'
              value='{data.garage.openingHoursWorkdays?.[1]}'
              on:change={(e) => isOpen24HoursWorkdays = e.target.checked}
              placeholder='Open To'
              required={!isOpen24HoursWorkdays}
              type='time'
              wrapperClass='flex-1'
            />
          </div>

          <h6 class='text-sm font-medium'>Weekends / Holidays</h6>
          <div class='flex gap-2 items-center'>
            <label class='mr-2'>
              <input
                bind:checked={isOpen24HoursWeekends}
                id='isOpen24HoursWeekends'
                name='isOpen24HoursWeekends'
                type='checkbox'
              />
              Is Open 24 Hours
            </label>
            <Input
              bind:disabled={isOpen24HoursWeekends}
              id='openFromWeekends'
              name='openFromWeekends'
              value='{data.garage.openingHoursWeekend?.[0]}'
              on:change={(e) => isOpen24HoursWeekends = e.target.checked}
              placeholder='Open From'
              required={!isOpen24HoursWeekends}
              type='time'
              wrapperClass='flex-1'
            />
            <Input
              bind:disabled={isOpen24HoursWeekends}
              id='openToWeekends'
              name='openToWeekends'
              value='{data.garage.openingHoursWeekend?.[1]}'
              on:change={(e) => isOpen24HoursWeekends = e.target.checked}
              placeholder='Open To'
              required={!isOpen24HoursWeekends}
              type='time'
              wrapperClass='flex-1'
            />
          </div>
        </div>

        <div class='flex flex-col gap-2'>
          <h6 class='font-medium'>Payment</h6>
          <div class='flex gap-2 items-center'>
            <Input
              id='hourlyRate'
              name='hourlyRate'
              placeholder='Hourly Rate'
              required
              step='0.01'
              min='0'
              value='{data.garage.hourlyRate}'
              type='number'
              wrapperClass='flex-1'
            />
            <Input
              id='maxRate'
              name='maxRate'
              placeholder='Maximum Rate'
              required
              step='0.01'
              min='0'
              value='{data.garage.maxRate}'
              type='number'
              wrapperClass='flex-1'
            />
          </div>

          <label class='mr-2'>
            <input
              id='ensureUserBalance'
              name='ensureUserBalance'
              checked='{data.garage.ensureUserBalance ? "checked" : undefined}'
              type='checkbox'
            />
            Ensure User has enough Balance
          </label>
          <label class='mr-2'>
            <input
              id='payOnExit'
              name='payOnExit'
              checked='{data.garage.payOnExit ? "checked" : undefined}'
              type='checkbox'
            />
            User pays on Exit
          </label>
        </div>

        {#if error}
          <small class='text-sm font-medium text-red-700'>
            {error.message}
          </small>
        {/if}
        {#if message}
          <small class='text-sm font-medium text-green-700'>
            {message}
          </small>
        {/if}

        <Button type='submit'>Save Settings</Button>
      </form>
    </div>
  </div>
{/if}
