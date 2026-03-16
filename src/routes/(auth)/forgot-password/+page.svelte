<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { _ } from 'svelte-i18n';

	let loading = $state(false);
	let errorMessage = $state('');
	
	onMount(() => {
		const emailInput = document.getElementById('email');
		if (emailInput) {
		emailInput.focus();
		}
	});
	
	const handleEnhance = () => {
		loading = true;
		errorMessage = '';

		return async ({ result }) => {
			loading = false;

			if (result.type === 'failure') {
				errorMessage = result.data?.message || 'Terjadi kesalahan';
			}

			if (result.type === 'success') {
				await goto('/login');
			}
		};
	};
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="grid lg:grid-cols-2 min-h-screen">
    
    <div class="hidden lg:block bg-indigo-700 dark:bg-indigo-900 relative overflow-hidden">
      <div class="w-full h-full bg-cover bg-center opacity-10" style="background-image: url('/images/tech-pattern.svg');"></div>
      <div class="absolute inset-0 flex flex-col justify-end p-12 text-white">
        <h1 class="text-4xl font-bold mb-4">Efficient Service Management</h1>
        <p class="text-lg">Your portal for quick access to work orders and scheduling.</p>
      </div>
    </div>
   
    <div class="flex items-center justify-center p-4 sm:p-8">
      <div class="w-full max-md py-8 px-4 sm:p-8 md:p-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition duration-500">
      
        <div class="space-y-6 text-center">
          <div class="flex justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-indigo-600 dark:text-indigo-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{$_('Forgot Password')}</h2>
          <p class="font-medium text-base text-gray-600 dark:text-gray-400">Enter your email to receive a reset link.</p>
        </div>
        
		{#if errorMessage}
			<div class="mt-8 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg" role="alert">
				{errorMessage}
			</div>
		{/if}

        
        <form method="POST" action="?/forgotPassword" use:enhance={handleEnhance} class="space-y-8 py-8">

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="your.name@servicecorp.com"
              class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div class="space-y-4">
            <button
              type="submit"
              disabled={loading}
              class="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-[1.005]"
            >
              {#if loading}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {$_('Processing...')}
              {:else}
                {$_('Send Reset Link')}
              {/if}
            </button>

            <div class="text-center">
              <a href="/login" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition">
                &larr; {$_('Back to Login')}
              </a>
            </div>
          </div>
        </form>

      </div>
    </div>
  </div>
</div>