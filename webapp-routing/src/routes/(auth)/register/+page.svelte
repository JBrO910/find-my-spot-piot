<!--suppress TypeScriptUnresolvedFunction -->
<script lang='ts'>
  import { applyAction, enhance } from '$app/forms'
  import Button from '../../../lib/components/Button.svelte'
  import Input from '../../../lib/components/Input.svelte'
  import type { ApiError, FieldError } from '../../../lib/types'

  let error: ApiError | FieldError | undefined = undefined
</script>

<h5 class='text-orange-500 font-medium text-4xl'>Register</h5>
<form
  action='?/register'
  class='flex flex-col gap-4 py-4 min-w-[400px]'
  method='POST'
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
    error={error?.field === "username" ? error.message : undefined}
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
  <Input
    error={error?.field === "passwordRepeat" ? error.message : undefined}
    id='passwordRepeat'
    name='passwordRepeat'
    placeholder='Repeat Password'
    required
    type='password'
  />
  <Button type='submit'>Register</Button>
  <a
    class='text-orange-500 hover:text-orange-700 hover:underline underline-offset-2 text-sm'
    href='/login'
  >Go to login
  </a>
</form>
