<script>
    
    import Header  from '$lib/components/Header.svelte'
    import { page } from '$app/stores'; // Impor store page

    let { data, children } = $props();
    
</script>

<Header data={data} currentPath={$page.url.pathname}/>

{@render children?.()}