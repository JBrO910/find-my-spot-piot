<script>
    import { globalSearchState } from '$lib/stores'

    export let placeholder = 'Search...'

    let timer
    let searchFieldValue = ''
    const debounceSearch = () => {
        $globalSearchState.bouncing = true
        clearTimeout(timer)
        timer = setTimeout(() => {
            $globalSearchState.bouncing = false
            $globalSearchState.term = searchFieldValue
        }, 500)
    }
</script>

<input
        bind:value={searchFieldValue}
        class='w-[480px]'
        on:input={debounceSearch}
        placeholder={placeholder}
        type='text'
/>
