<script lang="ts">
    import type { Spot } from '$lib/types.js'

    export let spot: Spot
</script>

<div class='flex justify-center items-center px-4 py-4 h-[100px] bg-green-700 rounded text-green-50' class:bg-red-700={spot.status}>
    {spot.id}
</div>
