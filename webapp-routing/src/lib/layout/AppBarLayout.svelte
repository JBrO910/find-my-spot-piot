<script>
    import SearchField from '$lib/components/Searchfield.svelte'
    import TopBar from '$lib/components/TopBar.svelte'
</script>

<div class='h-screen flex flex-col bg-gray-100'>
    <TopBar title='FindMySpot'>
        <slot
                name='content'
                slot='content'
        >
            <SearchField />
        </slot>
    </TopBar>
    <slot />
</div>
