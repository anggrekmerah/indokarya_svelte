<script>
  import { Bell, List } from 'lucide-svelte';
  import { ioClient } from '$lib/stores/socket.js';
  import { onMount } from 'svelte'; 
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Notif from '$lib/components/Notif.svelte'; 
  import { t } from 'svelte-i18n'; 
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let { data, currentPath } = $props(); 

  let totalTicket = $state(0);
  let totalNotif = $state(0);
  let messagesNotif = $state([]);

  totalTicket = data.dataTicketTotal.total_task ?? 0; 
  totalNotif = (data.dataTotalNotif[0] !== undefined) ? data.dataTotalNotif[0].total : 0; 

  // Logika penentuan judul berdasarkan path dengan i18n
  const getPageDetails = (path) => {
      if (path === '/home') return { title: $t('Home'), subtitle: 'HR Dashboard' }; 
      if (path === '/cuti') return { title: $t('Leave Request'), subtitle: $t('Leave Request') }; 
      if (path === '/absen-list') return { title: $t('Attendance History'), subtitle: 'February 2026' }; 
      return { title: $t('Application'), subtitle: 'HR Portal' }; 
  };

  let pageInfo = $derived(getPageDetails(currentPath)); 
  let openMenu = $state(null); 

  function toggleMenu(menuName) {
      openMenu = openMenu === menuName ? null : menuName; 
  }

  function closeMenu() {
      openMenu = null; 
  }

  $effect(async () => {
      const newPath = $page.url.pathname;
      if (newPath !== currentPath && !hasActiveFilters()) {
          currentPath = newPath;
      }
  });

  onMount(() => {

      if (ioClient) {
        console.log('Socket available. Attaching listener...');
            // socket.emit('join_user_room', 5);

          ioClient.on('totalTicket', (newData) => {
              totalTicket = newData.total_task
                console.log('New message total:', newData);
          });

          ioClient.on('totalNotif', (newData) => {
              totalNotif = newData.total
              console.log('New message total:', newData);
          });

          ioClient.on('TicketCreated', (newData) => {
              messagesNotif.push(newData)
              console.log('New ticket received:', newData);
          });

      }

  });
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
  <div class="max-w-4xl mx-auto flex justify-between items-center">
    <div>
      <h1 class="text-lg font-black text-slate-800 leading-tight">{pageInfo.title}</h1>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
        {$t('Work Mode')}: <span class="text-indigo-600">{data.users.work_base}</span>
      </p>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center text-xs font-semibold text-gray-600">
        <button 
            onclick={async () => { await goto('/task', { keepFocus: true, replaceState: true }) }} 
            class="relative p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none"
        >
            <List class="h-6 w-6" />
            {#if totalTicket != 0}
                <span class="absolute h-4 w-4 flex items-center justify-center -mt-8 -mr-1 text-[10px] font-bold text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/8">
                    {totalTicket}
                </span>    
            {/if}

        </button>
      </div>
      <button onclick={() => toggleMenu('notif')} class="relative p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none">
        <Bell class="h-6 w-6" />
        {#if totalNotif != 0}
            <span class="absolute h-4 w-4 flex items-center justify-center -mt-8 -mr-1 text-[10px] font-bold text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/8">
                {totalNotif}
            </span>    
        {/if}
        
      </button>
    </div>
  </div>
</header>

{#if openMenu}
    <div
        class="fixed inset-0 bg-black opacity-50 z-10"
        onclick={closeMenu}
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
        role="none"
    ></div>

    {#if openMenu === 'notif'}
        <div
            class="fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-xl z-20 h-[85vh] flex flex-col" 
            in:slide={{ duration: 300, easing: quintOut }}
            out:slide={{ duration: 300 }}
        >  
            <div class="flex justify-between items-center px-4 pt-4 pb-2 border-b sticky top-0 bg-white z-10">
                <h3 class="text-xl font-bold text-gray-800">{$t('Notifications')}</h3> 
                <button onclick={closeMenu} class="p-1">
                    <svg class="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <ul class="divide-y divide-gray-100 flex-grow overflow-y-auto px-4 pb-16">
                {#each data.dataListNotif as notification}
                    <Notif message={notification.content_payload} />    
                {/each}
                {#each messagesNotif as msg}
                    <Notif message={msg} /> 
                {/each}
            </ul>
        </div>
    {/if}
{/if}