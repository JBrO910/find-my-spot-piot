<!--suppress TypeScriptUnresolvedFunction -->
<script lang='ts'>
  import { applyAction, enhance } from '$app/forms'
  import Button from '$lib/components/Button.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { ApiError } from '$lib/types'

  let error: ApiError = undefined
  let loading = false
</script>

<h5 class='text-blue-500 font-medium text-4xl'>FindMySpot</h5>
<h6 class='text-blue-300 text-2xl'>Login</h6>
<form
  class='flex flex-col gap-4 py-4 min-w-[400px]'
  method='POST'
  action='?/login'
  use:enhance={() => {
      loading = true
          error = undefined
          return async ({result}) => {
              if(result.type === "invalid") {
                  error = result.data.error
                  return
              }
              loading = false
              await applyAction(result)
          }
      }}
>
  <Input
    id='username'
    name='username'
    placeholder='Username'
    required
    type='text'
  />
  <Input
    id='password'
    name='password'
    placeholder='Password'
    required
    type='password'
  />
<!--  <div class='flex gap-2'>-->
<!--    <input-->
<!--      id='keepLoggedIn'-->
<!--      name='keepLoggedIn'-->
<!--      type='checkbox'-->
<!--    />-->
<!--    <label for='keepLoggedIn'>Keep logged in</label>-->
<!--  </div>-->
  {#if error}
    <small class='text-red-700 text-sm font-medium mt-[-16px]'>{error.message}</small>
  {/if}
  <Button disabled={loading} type='submit'>Login</Button>
  <a href='/register' class='text-blue-500 hover:text-blue-700 hover:underline underline-offset-2 text-sm'>Register account</a>
</form>
