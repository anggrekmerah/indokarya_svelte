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
    .sync-indicator { 
        /* Mengunci posisi agar tidak bergeser saat scroll */
        position: fixed; 
        bottom: 70px; 
        right: 1px; 
        z-index: 9999; /* Memastikan indikator di atas elemen lain */
        font-size: 0.8rem;
        pointer-events: none; /* Agar tidak menghalangi klik pada elemen di bawahnya */
    }

    .badge { 
        padding: 5px 12px; /* Sedikit lebih besar agar mudah ditekan/dilihat */
        border-radius: 5px; 
        display: flex; 
        align-items: center; 
        gap: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* Tambah shadow agar kontras */
        pointer-events: auto; /* Mengembalikan fungsi klik hanya pada badge */
        transition: transform 0.2s ease;
    }

    .badge:hover {
        transform: translateY(-2px);
    }

    /* Sisanya tetap sama */
    .offline { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .pending { background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; animation: pulse 2s infinite; }
    .online { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
</style>