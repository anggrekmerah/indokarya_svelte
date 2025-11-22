<script>
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { ioClient } from '$lib/stores/socket.js'; 
    import TicketUnlock from '$lib/components/TicketUnlock.svelte';
    import TicketLock from '$lib/components/TicketLock.svelte';
    
    // ⭐ Impor SEMUA state dan logic dari store
    import { 
        items, 
        hasMore, 
        isLoading, 
        isOnline,
        loadInitialData,
        loadMoreItems 
    } from '$lib/stores/ticketStore.js'; 

    import { debounce } from '$lib/tools/utils.js';
    
    // Data dari SvelteKit load function
    let { data } = $props(); 

    // State Lokal/Observer
    let loadingSentinel = $state(/** @type {HTMLElement | null} */(null)); 
    let messages = $state([]);
    let observerInstance = null;
    
    // --- Lifecycle & Reactive Logic ---

    // 1. Logika pembaruan data utama ketika URL ($page.url.searchParams) berubah
    $effect( async () => {
        // Panggil fungsi terpusat, berikan URL params dan data awal dari server
        await loadInitialData('homeMetadata',$page.url.searchParams, data.listTicket);
    });

    // 2. Logika Infinite Scroll / Observer
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
        // Panggil checkIsOnline di sini jika masih diperlukan untuk init
        // (Atau pindahkan logika ini ke store.js)
        
        // Listener online/offline global
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

    // --- Utility Functions ---

    function cleanupObserver() {
        if (observerInstance) {
            observerInstance.disconnect();
            observerInstance = null;
        }
    }
    
    const debouncedLoadMore = debounce(async () => {
        // Panggil fungsi terpusat loadMoreItems
        await loadMoreItems('homeMetadata','/api/ticket/assigned',$page.url.searchParams);
    }, 100);

</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        
        {#if messages}
            {#each messages as ticket} 
                {#if ticket.ticket_priority_lock == 'N'}
                    <TicketUnlock ticket={ticket} />
                {:else}
                    <TicketLock ticket={ticket} />
                {/if}
            {/each}    
        {/if}
        
        {#each $items as ticket} 
            {#if ticket.ticket_priority_lock == 'N'}
                <TicketUnlock ticket={ticket} />
            {:else}
                <TicketLock ticket={ticket} />
            {/if}
        {:else}
            {#if !$isLoading && messages.length === 0}
                <div class="py-4 text-center text-gray-500">
                    <p>Tidak ada tiket ditemukan.</p>
                </div>
            {/if}
        {/each}
      
        {#if $hasMore} 
            <div bind:this={loadingSentinel} class="py-4 text-center">
                {#if $isLoading}
                    <p>Memuat item selanjutnya...</p>
                {:else}
                    <p>Scroll ke bawah untuk memuat lebih banyak</p> 
                {/if}
            </div>
        {:else}
            {#if $items.length > 0}
                <div class="py-4 text-center text-gray-500">
                    <p>Semua item telah dimuat. ({$items.length} total)</p>
                </div>
            {/if}
        {/if}

    </div>
</main>