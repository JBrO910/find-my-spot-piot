<script lang="ts">
    import { enhance, applyAction } from '$app/forms'
    import Button from '$lib/components/Button.svelte'
    import Input from '$lib/components/Input.svelte'
    import type { ApiError } from '$lib/types'

    let error: ApiError = undefined
</script>

<div class='flex flex-col items-center justify-center gap-2 p-4 h-full'>
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
      <Button type='submit'>Create Garage</Button>
    </form>
  </div>
</div>
