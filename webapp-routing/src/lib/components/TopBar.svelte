<script>
    export let title
</script>

<div>
    <div class='bg-gray-500 flex flex-1 h-16 items-center p-4 gap-8'>
        <a href='/'>
            <span class='text-gray-50 text-xl font-medium'>{title}</span>
        </a>
        <slot name='content'></slot>
    </div>
</div>
