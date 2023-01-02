<script lang='ts'>
  import { applyAction, enhance } from '$app/forms'
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { ApiError } from '$lib/types'

  let isOpen24HoursWorkdays = false
  let isOpen24HoursWeekends = false

  let error: ApiError | undefined = undefined
</script>

<div class='flex flex-col items-center justify-center gap-2 p-4'>
  <div class='rounded bg-gray-50 shadow px-4 py-2 w-1/2'>
    <h6 class='text-2xl font-medium'>Register Garage</h6>
    <form
      class='flex flex-col gap-4 py-4'
      use:enhance={() => {
          error = undefined
          return async ({result}) => {
              if(result.type === "invalid") {
                  error = result.data.error
                  return
              }
              await applyAction(result)
          }
      }}
    >
      <Input
        id='name'
        name='name'
        placeholder='Garage Name'
        required
        type='text'
        wrapperClass='flex-1'
      />
      <Input
        id='address'
        name='address'
        placeholder='Address'
        required
        type='text'
        wrapperClass='flex-1'
      />
      <Input
        id='phoneNumber'
        name='phoneNumber'
        placeholder='Phone Number'
        type='text'
        wrapperClass='flex-1'
      />
      <h6 class='text-lg font-medium'>Settings</h6>

      <div class='flex flex-col gap-2'>
        <h6 class='font-medium'>Opening Times</h6>

        <Input
          id='sleepTime'
          name='sleepTime'
          placeholder='Time between status checks in seconds'
          type='number'
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
            type='number'
            wrapperClass='flex-1'
          />
        </div>

        <label class='mr-2'>
          <input
            id='ensureUserBalance'
            name='ensureUserBalance'
            type='checkbox'
          />
          Ensure User has enough Balance
        </label>
        <label class='mr-2'>
          <input
            id='payOnExit'
            name='payOnExit'
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

      <Button type='submit'>Create Garage</Button>
    </form>
  </div>
</div>
