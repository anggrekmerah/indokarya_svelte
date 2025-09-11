<script>
    import { quintOut } from 'svelte/easing';
    import { fade, slide } from 'svelte/transition';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
   


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
            
            <span>{item.menu_name}</span>
          </a>
        {/each}

      {/if}
      
      <!-- Home Link -->
      <!-- <a
        href="/home"
        class="flex flex-col items-center transition-colors duration-200"
        class:text-blue-500={isPath('/home')}
        class:text-gray-500={!isPath('/home')}
      >
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"></path>
        </svg>
        <span>Home</span>
      </a> -->

      <!-- History Link -->
      <!-- <a
        href="/history"
        class="flex flex-col items-center transition-colors duration-200"
        class:text-blue-500={isPath('/history')}
        class:text-gray-500={!isPath('/history')}
      >
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>History</span>
      </a> -->

      <!-- Profile Link -->
      <!-- <a
        href="/profile"
        class="flex flex-col items-center hover:text-blue-600 transition-colors duration-200"
        class:text-blue-500={isPath('/profile')}
        class:text-gray-500={!isPath('/profile')}
      >
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.2c-2.5 0-4.71-1.24-6-3.13.09-2.02 4-3.13 6-3.13s5.91 1.11 6 3.13c-1.29 1.89-3.5 3.13-6 3.13z"></path>
        </svg>
        <span>Profile</span>
      </a> -->

    </div>
  </footer>
</div>