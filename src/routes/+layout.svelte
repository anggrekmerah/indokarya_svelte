<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Task App Layout</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}