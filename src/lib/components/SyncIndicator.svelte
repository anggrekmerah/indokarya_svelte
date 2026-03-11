<script>
    import { onMount } from 'svelte';
    import { isOnline } from '$lib/stores/ticketStore.js';
    import { pendingSyncCount, updatePendingCount } from '$lib/stores/syncStatus.js';

    onMount(() => {
        // Cek jumlah pending setiap kali komponen dimuat
        updatePendingCount();

        // Opsional: Cek berkala setiap 30 detik
        const interval = setInterval(updatePendingCount, 30000);
        return () => clearInterval(interval);
    });
</script>

<div class="sync-indicator">
    {#if !$isOnline}
        <span class="badge offline">
            <i class="icon-offline"></i> Offline Mode
        </span>
    {:else if $pendingSyncCount > 0}
        <span class="badge pending">
            <i class="icon-sync"></i> Menunggu Sinkron ({$pendingSyncCount})
        </span>
    {:else}
        <span class="badge online">
            <i class="icon-check"></i> Terhubung & Sinkron
        </span>
    {/if}
</div>

<style>
    .sync-indicator { font-size: 0.8rem; padding: 10px; }
    .badge { padding: 4px 8px; border-radius: 12px; display: flex; align-items: center; gap: 5px; }
    .offline { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .pending { background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; animation: pulse 2s infinite; }
    .online { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
</style>