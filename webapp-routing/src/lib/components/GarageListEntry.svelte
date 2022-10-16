<script lang="ts">
    import { MarkerIcon, PhoneIcon } from '$lib/icons'
    import type { GarageOverview } from '$lib/types'

    export let garage: GarageOverview
</script>

<a href={`/garage/${garage.id}`} class='card'>
    <div>
        <h6 class='text-lg'>{garage.name}</h6>
        <div class='flex items-center'>
            <MarkerIcon class='mr-1 text-sm text-gray-500' />
            <small class='mt-1 mr-4 text-sm text-gray-500 font-light'>{garage.address}</small>
            <PhoneIcon class='mr-1 text-sm text-gray-500' />
            <small class='mt-1 text-sm text-gray-500 font-light'>{garage.phoneNumber}</small>
        </div>
    </div>
    <div class='divider'></div>
    <div>
        <p class='min-w-[2em] text-end'>{garage.freeSpots}/{garage.totalSpots}</p>
        <small class='text-sm text-gray-500'>Free Spots</small>
    </div>
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
            bg-gray-50
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
