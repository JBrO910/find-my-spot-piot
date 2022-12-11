<script>
    import { goto } from '$app/navigation'
    import Banner from '$lib/components/Banner.svelte'
    import Button from '$lib/components/Button.svelte'
    import Snackbar from '$lib/components/Snackbar.svelte'
    import TopBar from '$lib/components/TopBar.svelte'
    import PowerIcon from '$lib/icons/PowerIcon.svelte'

    import {page} from '$app/stores'

    const navigateToRegister = () => {
        goto('/garage/register')
    }
    const navigateToUsers = () => {
        goto('/user/register')
    }
    const navigateToParkingHistory = () => {
        goto('/user/parkingHistory')
    }
</script>

<svelte:head>
    <title>FindMySpot</title>
</svelte:head>

<div class='h-screen flex flex-col bg-gray-100'>
    <TopBar title='FindMySpot'>
        <div slot='content' class='flex flex-1 items-center'>
            <h6 class='text-gray-50 text-md italic'>{$page.data?.page?.name}</h6>
            <form class='ml-auto flex items-center gap-4' action='/login?/logout' method='POST'>
                {#if $page.data?.page?.user}
                    <small class='text-sm text-gray-50'>Hello, {$page.data?.page?.user?.username}</small>
                    {#if $page.data.page.user.isAdmin}
                        <Button color='secondary' type='button' on:click={navigateToRegister}>Add Garage</Button>
                        <Button color='secondary' type='button' on:click={navigateToUsers}>Register Cards</Button>
                    {:else}
                        {#if $page.data.page.user.cardID === "no-card"}
                            <small class='text-sm text-gray-50'>Card is not yet registered</small>
                        {:else}
                            <small class='text-sm text-gray-50'>Current Balance: {$page.data.page.user.balance.toFixed(2)}€</small>
                            {#if $page.routeId !== "(app)/user/parkingHistory"}
                                <Button color='secondary' type='button' on:click={navigateToParkingHistory}>Parking History</Button>
                            {/if}
                        {/if}
                    {/if}
                {:else}
                    No user found
                {/if}
                <Button color='error'><PowerIcon class='text-xl' slot='iconLeft'/> Logout</Button>
            </form>
        </div>
    </TopBar>

    {#if $page.data?.page?.error}
        <Banner
          type='error'
          title={$page.data.page.error.message}
          description={$page.data.page.error.description}
        />
    {/if}

    <div class='h-screen overflow-y-auto'>
        <slot />
    </div>

    <Snackbar />
</div>

