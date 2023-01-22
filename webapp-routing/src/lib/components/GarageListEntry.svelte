<script lang='ts'>
  import { MarkerIcon, PhoneIcon } from '$lib/icons'
  import type { GarageOverview } from '$lib/types'

  export let garage: GarageOverview
</script>

<a
  class='card'
  href={!garage.totalSpots ? `/garage/${garage.id}/setup` : `/garage/${garage.id}`}
>
  <div>
    <h6 class='text-lg'>{garage.name}</h6>
    <div class='mt-1 flex items-center'>
      <MarkerIcon class='mr-1 text-sm text-gray-500' />
      <small class='mr-4 text-sm text-gray-500 dark:text-gray-300 font-light'>{garage.address}</small>
      <PhoneIcon class='mr-1 text-sm text-gray-500' />
      <small class='text-sm text-gray-500 dark:text-gray-300 font-light'>{garage.phoneNumber}</small>
    </div>
  </div>
  <div class='divider'></div>
  {#if !!garage.totalSpots}
    <div>
      <p class='min-w-[2em] text-end'>{garage.freeSpots}/{garage.totalSpots}</p>
      <small class='text-sm text-gray-500 dark:text-gray-300 font-light'>Free Spots</small>
    </div>
  {:else}
    <div>
      <p class='min-w-[2em] text-end'>Not Set Up</p>
      <small class='text-sm text-gray-500'>Garage is not set up properly</small>
    </div>
  {/if}
</a>

<style lang='postcss'>
    @tailwind components;

    @layer components {
        .card {
            @apply
            flex
            items-center
            rounded
            p-4
            shadow
            bg-gray-50 dark:bg-gray-800
            hover:bg-orange-50 dark:hover:bg-orange-700
            hover:shadow-md
            hover:cursor-pointer
        }

        .divider {
            @apply
            w-[1px]
            h-full
            ml-auto
            mr-4
            bg-gray-300
        }
    }
</style>
