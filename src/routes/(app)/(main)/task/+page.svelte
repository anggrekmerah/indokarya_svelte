<script>
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { ioClient } from '$lib/stores/socket.js'; 
    import TicketUnlock from '$lib/components/TicketUnlock.svelte';
    import TicketLock from '$lib/components/TicketLock.svelte';
    import TicketReadOnly from '$lib/components/TicketReadOnly.svelte';
    import {  t } from 'svelte-i18n';
    import { 
        items, 
        hasMore, 
        isLoading, 
        isOnline,
        loadInitialData,
        loadMoreItems 
    } from '$lib/stores/ticketStore.js'; 

    import { debounce } from '$lib/tools/utils.js';
    
    let { data } = $props(); 

    let loadingSentinel = $state(/** @type {HTMLElement | null} */(null)); 
    let messages = $state([]);
    let observerInstance = null;
    
    
    $effect( async () => {
        await loadInitialData('taskMetadata',$page.url.searchParams, data.listTicket);
    });

    $effect( () => {
        cleanupObserver();

        if ($hasMore && loadingSentinel) { 
            const observer = new IntersectionObserver( (entries) => {
                if (entries[0].isIntersecting && !$isLoading && $hasMore) { 
                    debouncedLoadMore();
                }
            }, {
                rootMargin: '0px 0px 100px 0px' 
            });

            observer.observe(loadingSentinel);
            observerInstance = observer;
        }
    });

    onMount( async () => {
        window.addEventListener('online', () => { isOnline.set(true); });
        window.addEventListener('offline', () => { isOnline.set(false); });
        
        if (ioClient) {
            ioClient.on('TicketCreated', (newData) => {
                console.log('TicketCreated')
                console.log(newData)
                messages.push(newData.data)
            });
        }
    });

    onDestroy(() => {
         cleanupObserver();
    });

    function cleanupObserver() {
        if (observerInstance) {
            observerInstance.disconnect();
            observerInstance = null;
        }
    }
    
    const debouncedLoadMore = debounce(async () => {
        await loadMoreItems('taskMetadata','/api/ticket/assigned',$page.url.searchParams);
    }, 100);

</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        
        {#if messages}
            {#each messages as ticket} 
                {#if data.userHelper}
                    <TicketReadOnly {ticket} />
                {:else}
                    {#if ticket.ticket_priority_lock == 'N'}
                        <TicketUnlock {ticket} />
                    {:else}
                        <TicketLock {ticket} />
                    {/if}
                {/if}
                <!-- {#if ticket.ticket_priority_lock == 'N'}
                    <TicketUnlock ticket={ticket} />
                {:else}
                    <TicketLock ticket={ticket} />
                {/if} -->
            {/each}    
        {/if}
        
        {#each $items as ticket} 
            {#if data.userHelper}
                <TicketReadOnly {ticket} />
            {:else}
                {#if ticket.ticket_priority_lock == 'N'}
                    <TicketUnlock {ticket} />
                {:else}
                    <TicketLock {ticket} />
                {/if}
            {/if}
            <!-- {#if ticket.ticket_priority_lock == 'N'}
                <TicketUnlock ticket={ticket} />
            {:else}
                <TicketLock ticket={ticket} />
            {/if} -->
        {:else}
            {#if !$isLoading && messages.length === 0}
                <div class="py-4 text-center text-gray-500">
                    <p>{$t('Tidak ada tiket ditemukan')}.</p>
                </div>
            {/if}
        {/each}
      
        {#if $hasMore} 
            <div bind:this={loadingSentinel} class="py-4 text-center">
                {#if $isLoading}
                    <p>{$t('Memuat item selanjutnya...')}</p>
                {:else}
                    <p>{$t('Scroll ke bawah untuk memuat lebih banyak')}</p> 
                {/if}
            </div>
        {:else}
            {#if $items.length > 0}
                <div class="py-4 text-center text-gray-500">
                    <p>{$t('Semua item telah dimuat')}. ({$items.length} total)</p>
                </div>
            {/if}
        {/if}

    </div>
</main>