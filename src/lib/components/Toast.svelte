<script>
    import { notification } from '$lib/stores/notificationStore';
    import { fly } from 'svelte/transition';
</script>

{#if $notification}
    <div 
        transition:fly={{ y: -50, duration: 300 }} 
        class="toast-container {$notification.type}"
    >
        <div class="icon">
            {#if $notification.type === 'success'} ✅ {/if}
            {#if $notification.type === 'error'} ❌ {/if}
            {#if $notification.type === 'warning'} ⚠️ {/if}
            {#if $notification.type === 'info'} ℹ️ {/if}
        </div>

        <div class="toast-content">
            <strong>{$notification.title}</strong>
            <p>{$notification.body}</p>
        </div>
        
        <button on:click={() => notification.set(null)}>×</button>
    </div>
{/if}

<style>
    .toast-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        min-width: 320px;
        max-width: 90%;
    }

    /* Variasi Warna */
    .info { background-color: #3b82f6; }    /* Biru */
    .success { background-color: #10b981; } /* Hijau */
    .error { background-color: #ef4444; }   /* Merah */
    .warning { background-color: #f59e0b; } /* Oranye */

    .icon { font-size: 1.2rem; }
    .toast-content { flex: 1; }
    strong { display: block; font-size: 14px; font-weight: 700; }
    p { margin: 0; font-size: 13px; opacity: 0.9; }
    
    button { 
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    button:hover { background: rgba(255, 255, 255, 0.4); }
</style>