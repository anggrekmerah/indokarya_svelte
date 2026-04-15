<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte'
	import Toast from '$lib/components/Toast.svelte';
	import { locale } from 'svelte-i18n';
	import '$lib/stores/i18n';

	let { children } = $props();

	let isDesktop = false;

    onMount(() => {
        // Cek lebar layar atau user agent di client
        if (window.innerWidth > 1024) {
            isDesktop = true;
        }

		const lang = document.documentElement.lang;
		if (lang) {
			$locale = lang;
		}
		
    });

</script>

<svelte:head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Task App Layout</title>
<link rel="icon" href={favicon} />
<style>
    .desktop-warning {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        background: #f4f4f4;
    }
</style>
</svelte:head>
<LoadingIndicator />
<Toast />
{#if isDesktop}
    <div class="desktop-warning">
        <h1>Gunakan Smartphone Anda</h1>
        <p>Silakan buka situs ini melalui perangkat Android atau iOS untuk melanjutkan.</p>
    </div>
{/if}
{@render children()}