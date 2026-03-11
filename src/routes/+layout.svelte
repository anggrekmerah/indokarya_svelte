<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte'
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

</script>

<svelte:head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Task App Layout</title>
<link rel="icon" href={favicon} />
</svelte:head>
<LoadingIndicator />
<Toast />
{@render children()}