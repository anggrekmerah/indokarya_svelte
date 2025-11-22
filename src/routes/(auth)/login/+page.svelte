<script>
  // @ts-nocheck
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  let loading = false;
  
  /** @type {import('./$types').ActionData} */
  export let form;

  onMount(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  });

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
      
      <div hidden role="hidden" class="fixed inset-0 w-full ml-auto bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm"></div>

      <div class="w-full max-w-md py-8 px-4 sm:p-8 md:p-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition duration-500">
      
        <div class="space-y-6 text-center">
          <div class="flex justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-indigo-600 dark:text-indigo-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9.75 9H9c-.75 0-1.5-.045-2.25-.133m0 0l-.75 6.002.045.093l.363-.09-.363-.09M7.5 15.75l-.363-.09.363-.09M9.75 9l-1.5-.133C7.5 8.867 6.75 8.822 6 8.822m3.75 0V7.5c0-.663-.263-1.3-.732-1.768S6.337 5 5.675 5H4.5M2.25 12h19.5" />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Technician Portal Login</h2>
          <p class="font-medium text-base sm:text-lg text-gray-600 dark:text-gray-400">Sign in to access your work schedule.</p>
        </div>
        
        {#if form?.success === false && form?.message !== 'Logged out'}
          <div class="mt-8 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg" role="alert">
            {form?.message}
          </div>
        {/if}
        
        <form method="POST" action="?/login" class="space-y-8 py-8" use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            update();
          };
        }}>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="your.name@servicecorp.com"
              class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div class="flex flex-col items-end">
            <label for="password" class="block w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
            <button type="reset" class="w-max mt-2 p-1">
              <span class="text-xs tracking-wide text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition">{$_('Forgot Password')}?</span>
            </button>
          </div>

          <div>
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
              {$_('Logging In...')}
            {:else}
              **{$_('Sign In to Portal')}**
            {/if}
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</div>