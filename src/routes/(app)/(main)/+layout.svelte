<script>
    let { data, children } = $props();

    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { _ } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { ioClient } from '$lib/stores/socket.js';
    import { goto } from '$app/navigation';
    import { XCircle, Funnel, Calendar } from 'lucide-svelte';

    // State variables for each menu's open/close state
    let openMenu = $state(null); // 'status', 'date', or 'category'
    let currentStatus = $state(null);

    // Date menu state
    let fromDate = $state('');
    let toDate = $state('');

    /**
     * Toggles the state of the menus.
     * @param {string} menuName - The name of the menu to toggle.
     */
    function toggleMenu(menuName) {
        openMenu = openMenu === menuName ? null : menuName;
    }

    /**
     * Closes the menu when the overlay is clicked.
     */
    function closeMenu() {
        openMenu = null;
    }

    let totalTicket = $state(0);
    
    totalTicket = data.dataTicketTotal.total_task

    onMount(() => {

        if (ioClient) {
            console.log('Socket available. Attaching listener...');
            // socket.emit('join_user_room', 5);

            ioClient.on('totalTicket', (newData) => {
                totalTicket = newData.total_task
                console.log('New message total:', newData);
            });
        }

        for (const status in data.dataTicketStatus) {
            const sts = data.dataTicketStatus[status]
            
            if(sts.id_ticket_status === parseInt(data.id_status) ){
                currentStatus = sts.status_name
                return false
            } else {
                currentStatus = null
            }
        }
        
    });
    
</script>


<header class="bg-blue-50 shadow p-4 md:p-6 sticky top-0 z-10">
    <div class="flex items-center justify-between gap-4">
    <div class="relative flex-1 max-w-lg mx-auto">
      <input type="text" placeholder="Search tasks..." class="w-full pl-5 pr-16 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 shadow-sm transition-shadow duration-200">
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center text-xs font-semibold text-gray-600">
        <button onclick={() => {currentStatus = null, goto('/home')}} class="relative p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 412 412" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M197.8 100.3C208.7 107.9 211.3 122.9 203.7 133.7L147.7 213.7C143.6 219.5 137.2 223.2 130.1 223.8C123 224.4 116 222 111 217L71 177C61.7 167.6 61.7 152.4 71 143C80.3 133.6 95.6 133.7 105 143L124.8 162.8L164.4 106.2C172 95.3 187 92.7 197.8 100.3zM197.8 260.3C208.7 267.9 211.3 282.9 203.7 293.7L147.7 373.7C143.6 379.5 137.2 383.2 130.1 383.8C123 384.4 116 382 111 377L71 337C61.6 327.6 61.6 312.4 71 303.1C80.4 293.8 95.6 293.7 104.9 303.1L124.7 322.9L164.3 266.3C171.9 255.4 186.9 252.8 197.7 260.4zM288 160C288 142.3 302.3 128 320 128L544 128C561.7 128 576 142.3 576 160C576 177.7 561.7 192 544 192L320 192C302.3 192 288 177.7 288 160zM288 320C288 302.3 302.3 288 320 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L320 352C302.3 352 288 337.7 288 320zM224 480C224 462.3 238.3 448 256 448L544 448C561.7 448 576 462.3 576 480C576 497.7 561.7 512 544 512L256 512C238.3 512 224 497.7 224 480zM128 440C150.1 440 168 457.9 168 480C168 502.1 150.1 520 128 520C105.9 520 88 502.1 88 480C88 457.9 105.9 440 128 440z" />
            </svg>

            {#if totalTicket != 0}
                <span class="absolute h-4 w-4 flex items-center justify-center -mt-8 -mr-1 text-xs font-bold text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/8">
                    {totalTicket}
                </span>    
            {/if}
            
        </button>
      </div>
      <button class="relative p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9.073a6.002 6.002 0 0 0-12 0v.677a8.967 8.967 0 0 1-2.312 6.022c1.733.564 3.597.922 5.518 1.044a23.848 23.848 0 0 0 5.454-1.31Zm4.962-10.027a.75.75 0 0 0-1.06 0L12 11.239l-6.75-6.75a.75.75 0 0 0-1.06 1.06L10.94 12.3l-6.75 6.75a.75.75 0 0 0 1.06 1.06L12 13.319l6.75 6.75a.75.75 0 0 0 1.06-1.06L13.06 12.3l6.75-6.75a.75.75 0 0 0 0-1.06Z" />
        </svg>
        <span class="absolute h-4 w-4 flex items-center justify-center -mt-8 -mr-1 text-xs font-bold text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/8">3</span>
      </button>
    </div>
  </div>

    
</header>
<div class="border-b-1 bg-white flex justify-between items-center text-sm md:text-base py-1 px-1 bt-1 sticky top-19 z-10 overflow-x-auto ">
    
    <button onclick={() => toggleMenu('status')} class="mr-1 rounded-full bg-gray-100 flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500 ">
        <span class="inline-flex items-center gap-1">
            <Funnel class="h-4 w-4"/>
            Status
        </span>
    </button>

    <button onclick={() => toggleMenu('date')} class="mr-1 rounded-full bg-gray-100 flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
        <span class="inline-flex items-center gap-1">
            <Calendar class="h-4 w-4"/>
            {$_('Date')}
        </span>
    </button>

    <button onclick={() => toggleMenu('category')} class="rounded-full bg-gray-100 flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
        <span class="inline-flex items-center gap-1">
            <Funnel class="h-4 w-4"/>
            {$_('Category')}
        </span>
    </button>

</div>
<div class="border-b-1 bg-white flex items-center gap-2 py-1 px-3 sticky top-19 z-10 overflow-x-auto text-xs whitespace-nowrap">
   
    <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
        <span class="font-medium">Status:</span>
        Open
    </div>
    <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
        <span class="font-medium">Date:</span>
        2023-02-02 to 2023-03-03
    </div>
    <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
        <span class="font-medium">Priority:</span>
        Urgent
    </div>
    <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
        <XCircle class="h-6 w-6" />
    </div>
</div>
{#if openMenu}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 z-10"
        onclick={closeMenu}
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
        role="none"
    ></div>

    <div
        class="fixed bottom-0 left-0 right-0 bg-white shadow-xl p-4 rounded-t-lg z-20 max-h-[150vh] overflow-y-auto h-100"
        in:slide={{ duration: 300, easing: quintOut }}
        out:slide={{ duration: 300 }}
    >
        {#if openMenu === 'status'}
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">{$_('Select Status')}</h3>
                <ul class="space-y-1 text-sm">
                    {#each data.dataTicketStatus as status}
                        <li>
                            <button 
                            onclick={async ()=>{currentStatus=status.status_name, openMenu=null , await goto('/'+data.segment+'?status='+status.id_ticket_status) } }
                            class="w-full text-left p-3 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
                                {$_(status.status_name)}
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}

        {#if openMenu === 'date'}
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">{$_('Filter by Date')}</h3>
                <div class="flex flex-col space-y-4">
                    <label>
                        <span class="text-sm text-gray-600">{$_('From Date')}:</span>
                        <input type="date" bind:value={fromDate} class="w-full mt-1 p-2 border rounded-md">
                    </label>
                    <label>
                        <span class="text-sm text-gray-600">{$_('To Date')}:</span>
                        <input type="date" bind:value={toDate} class="w-full mt-1 p-2 border rounded-md">
                    </label>
                    <button class="w-full mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        {$_('Submit')}
                    </button>
                </div>
            </div>
        {/if}

        {#if openMenu === 'category'}
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">{$_('Select Category')}</h3>
                <ul class="space-y-2 text-sm">
                    {#each data.dataTicketPriority as priority}
                        <li>
                            <button class="w-full text-left p-2 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
                                {$_(priority.priority_name)}
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
{/if}
{@render children?.()}