<script lang="ts">
    import type { CombinedSpot } from '$lib/types.js'

    export let spot: CombinedSpot | undefined

    $: statusClass = !spot ? 'bg-gray-500' : !spot?.status ? 'bg-red-700' : 'bg-green-700'
    $: gridLocationStyle = `grid-column: ${spot?.x + 1}; grid-row: ${spot?.y + 1};`
</script>

<div class={statusClass + ' flex justify-center items-center px-4 py-4 h-[100px] text-green-50 outline outline-1 outline-gray-300'} style={gridLocationStyle}>
    {spot?.id ?? ""}
</div>
