<script>
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
    import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';
    import Toast from '$lib/components/Toast.svelte';
    import { locale } from 'svelte-i18n';
    import '$lib/stores/i18n';
    // Import variabel publik dari SvelteKit env
    import { PUBLIC_ENVIRONMENT } from '$env/static/public';

    let { children } = $props();

    let isDesktop = $state(false);

    function checkDevice() {
        if (typeof window === 'undefined') return;

        // 1. Cek jika environment adalah 'dev' atau 'development', nonaktifkan blokir desktop
        const currentEnv = (PUBLIC_ENVIRONMENT || '').toLowerCase();
        if (currentEnv === 'dev' || currentEnv === 'development') {
            isDesktop = false;
            return;
        }

        // 2. Deteksi User-Agent (Pemeriksaan perangkat HP/Tablet)
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUserAgent = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        // 3. Deteksi Ukuran Layar
        const isWideScreen = window.innerWidth > 1024;

        // Jika bukan HP ATAU layarnya lebar, tampilkan peringatan desktop
        isDesktop = !isMobileUserAgent || isWideScreen;
    }

    onMount(() => {
        checkDevice();

        window.addEventListener('resize', checkDevice);

        const lang = document.documentElement.lang;
        if (lang) {
            $locale = lang;
        }

        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    });
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Task App Layout</title>
    <link rel="icon" href={favicon} />
</svelte:head>

<LoadingIndicator />
<Toast />

{#if isDesktop}
    <div class="desktop-warning">
        <div class="card">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            <h1>Gunakan Smartphone Anda</h1>
            <p>Situs ini hanya dirancang untuk perangkat mobile. Silakan buka kembali melalui ponsel Anda.</p>
        </div>
    </div>
{:else}
    {@render children()}
{/if}

<style>
    .desktop-warning {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #0f172a;
        color: #f8fafc;
        padding: 20px;
        box-sizing: border-box;
    }

    .card {
        max-width: 400px;
        text-align: center;
        background: #1e293b;
        padding: 32px 24px;
        border-radius: 16px;
        border: 1px solid #334155;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .icon {
        margin-bottom: 16px;
        color: #38bdf8;
    }

    h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 8px 0;
    }

    p {
        font-size: 0.875rem;
        color: #94a3b8;
        line-height: 1.5;
        margin: 0;
    }
</style>