<script>
    import { quintOut } from 'svelte/easing';
    import { fade, slide } from 'svelte/transition';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n';


    // The provided children prop for rendering content
    /** @type {import('./$types').LayoutProps} */
    let { data, children } = $props();

    // Derived state to check the current path
    const isPath = (href) => {
        // return url.pathname === href;
        return $page.url.pathname === href;
    };
    
</script>
 
<div class="flex flex-col h-screen bg-gray-50">

{@render children?.()}
      
  <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-20">
 
    
    <div class="flex justify-around text-center text-xs sm:text-sm">
      
      {#if data.users}
       
        {#each data.users.menus as item}
          <a
            href="{item.menu_url}"
            class="flex flex-col items-center transition-colors duration-200"
            class:text-blue-500={isPath(item.menu_url)}
            class:text-gray-500={!isPath(item.menu_url)}
          >
            <svg class="w-6 h-6 mb-1"  fill="currentColor"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="{item.menu_icon}"/>
            </svg>
            
            <span>{$_(item.menu_name)}</span>
          </a>
        {/each}

      {/if}
      
    </div>
  </footer>
</div>