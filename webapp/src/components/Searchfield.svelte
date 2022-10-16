<script>
    import {globalSearchState} from "../lib/stores.js"

    let timer
    let searchFieldValue = ""
    const debounceSearch = () => {
        $globalSearchState.bouncing = true
        clearTimeout(timer)
        timer = setTimeout(() => {
            $globalSearchState.bouncing = false
            $globalSearchState.term = searchFieldValue
        }, 500)
    }
</script>

<main>
    <input class='w-[480px]' type='text' on:input={debounceSearch} bind:value={searchFieldValue}/>
</main>
