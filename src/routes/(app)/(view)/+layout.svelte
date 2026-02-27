<script>
    
    import Header from '$lib/components/Header.svelte'
    
    let { data, children } = $props();

</script>

<Header data={data} />

{@render children?.()}