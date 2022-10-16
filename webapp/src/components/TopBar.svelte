<script>
    import Searchfield from './Searchfield.svelte'

    export let title
</script>

<main>
    <div class='bg-gray-500 flex flex-1 h-16 items-center p-4 gap-8'>
        <span class='text-gray-50 text-xl'>{title}</span>
        <Searchfield />
    </div>
</main>
