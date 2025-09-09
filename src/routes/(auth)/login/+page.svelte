

<script lang="ts">
  // @ts-nocheck
  // This script section contains the Svelte logic for the login form.
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  
  // A loading state to show a spinner or disable the button during submission.
  let loading = false;
  
  /** @type {import('./$types').ActionData} */
  export let form;

  // Use onMount to add focus to the email input when the component is ready.
  onMount(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  });

</script>

<!-- 
  This section contains the HTML structure and Tailwind CSS styling.
  The design is mobile-first and uses flexbox for a clean, centered layout.
-->
<div class="2xl:container h-screen m-auto">
  <div hidden class="fixed inset-0 w-7/12 lg:block">
      <span class="absolute left-6 bottom-6 text-sm">Video by MART PRODUCTION from <a href="https://www.pexels.com/" target="blank" title="Pexels">Pexels</a></span>
      <video class="w-full h-full object-cover" loop autoplay src="/videos/video.mp4" poster="/images/bg.jpg">
      <track kind="caption" />
      </video>
  </div>
  <div hidden role="hidden" class="fixed inset-0 w-6/12 ml-auto bg-white bg-opacity-70 backdrop-blur-xl lg:block"></div>
    <div class="relative h-full ml-auto lg:w-6/12">
      <div class="m-auto py-12 px-6 sm:p-5 xl:w-10/12">
        <div class="space-y-4">
            <a href="#">
                <img src="/images/logo.svg" class="w-40" alt="tailus logo">
            </a>
            <p class="font-medium text-lg text-gray-600">Welcome to tailus ! Login first</p>
        </div>
        
        <div class="mt-12 grid gap-6 sm:grid-cols-2">
            <button class="py-3 px-6 rounded-xl bg-blue-50 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200">
                <div class="flex gap-4 justify-center">
                    <img src="/images/google.svg" class="w-5" alt="">
                    <span class="block w-max font-medium tracking-wide text-sm text-blue-700">with  Google</span>
                </div>
            </button>
            <button class="py-3 px-6 rounded-xl bg-gray-900 transition hover:bg-gray-800 active:bg-gray-600 focus:bg-gray-700">
                <div class="flex gap-4 items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    <span class="block w-max font-medium tracking-wide text-sm text-white">with Github</span>
                </div>
            </button>
        </div>

        <div role="hidden" class="mt-12 border-t">
            <span class="block w-max mx-auto -mt-3 px-4 text-center text-gray-500 bg-white">Or</span>
        </div>

        <!-- Error Message Display -->
        {#if form?.success === false && form?.message !== 'Logged out'}
          <div class="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg" role="alert">
            {form?.message}
          </div>
        {/if}
        
        <form method="POST" action="?/login" class="space-y-6 py-6" use:enhance={() => {
            loading = true; // Set loading to true when submission starts
            return async ({ update }) => {
                loading = false; // Set loading to false when submission finishes
                update(); // Update the page data (optional, but good practice)
            };
        }} >
            <div>
              <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full py-3 px-6 ring-1 ring-gray-300 rounded-xl placeholder-gray-600 bg-transparent transition disabled:ring-gray-200 disabled:bg-gray-100 disabled:placeholder-gray-400 invalid:ring-red-400 focus:invalid:outline-none"
            />
            </div>

            <div class="flex flex-col items-end">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="w-full py-3 px-6 ring-1 ring-gray-300 rounded-xl placeholder-gray-600 bg-transparent transition disabled:ring-gray-200 disabled:bg-gray-100 disabled:placeholder-gray-400 invalid:ring-red-400 focus:invalid:outline-none"
              />
              <button type="reset" class="w-max p-3 -mr-3">
                  <span class="text-sm tracking-wide text-blue-600">Forgot password ?</span>
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {#if loading}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              {:else}
                Sign In
              {/if}
              </button>
            </div>
        </form>

      </div>
    </div>
  </div>

<style>
  /* You can add custom styles here if needed, but Tailwind handles most of the work. */
</style>
