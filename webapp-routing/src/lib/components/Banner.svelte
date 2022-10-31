<script lang='ts'>
  export let type: 'error' | 'secondary' | 'success' = 'secondary'
  export let title: string
  export let description: string
</script>

<div class='bg-red-700 text-red-50 rounded px-4 py-2 space-y-1 m-2'>
  <h6 class='text-xl font-medium'>{title}</h6>
  {#if description}
    <p class='text-xm'>{description}</p>
  {/if}
</div>
