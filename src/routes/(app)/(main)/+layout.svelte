<script>
    let { data, children } = $props();

    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { _ } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { ioClient } from '$lib/stores/socket.js';
    import { goto } from '$app/navigation';
    import { XCircle, Funnel, Calendar, Bell, List } from 'lucide-svelte';
    import { page } from '$app/stores';
    import  Notif  from '$lib/components/Notif.svelte'

    // State variables for each menu's open/close state
    let openMenu = $state(null); // 'status', 'date', or 'category'
    let currentPath = $state(false);

    let defFilter = {
        "status" : null,
        "date" : null,
        "category" : null,
        "id_ticket" : null
    }
    let currentFilter = $state(defFilter);

    // Date menu state
    let fromDate = $state('');
    let toDate = $state('');
    let ticket = $state('');

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
    let totalNotif = $state(0);
    let messagesNotif = $state([]);

    totalTicket = data.dataTicketTotal.total_task ?? 0
    totalNotif = (data.dataTotalNotif[0] !== undefined) ? data.dataTotalNotif[0].total : 0

    function hasActiveFilters() {
        const searchParams = $page.url.searchParams;

        // Check if any of the filter parameters exists and is not an empty string
        const status = searchParams.get('status');
        if (status && status !== '') {
            return true;
        }

        const priority = searchParams.get('priority');
        if (priority && priority !== '') {
            return true;
        }

        const dateFrom = searchParams.get('from');
        if (dateFrom && dateFrom !== '') {
            return true;
        }

        const dateTo = searchParams.get('to');
        if (dateTo && dateTo !== '') {
            return true;
        }

        // If none of the checks returned true, then no active filters exist.
        return false;
    }
    
    $effect(async () => {
        const newPath = $page.url.pathname;
        console.log('newPath', newPath)
        console.log('currentPath', currentPath)
        if (newPath !== currentPath && !hasActiveFilters()) {
            console.log(`[PAGE CHANGE END] New path detected: ${newPath}`);
            await resetFilter()
            // Update the tracker
            currentPath = newPath;
        }
    })

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

        const persistedStatus = localStorage.getItem('currentFilterStatus');
        if (persistedStatus) {
            currentFilter.status = JSON.parse(persistedStatus);
        }

        const persistedDate = localStorage.getItem('currentFilterDate');
        if (persistedDate) {
            currentFilter.date = JSON.parse(persistedDate);
        }

        const persistedCategory = localStorage.getItem('currentFilterCategory');
        if (persistedCategory) {
            currentFilter.category = JSON.parse(persistedCategory);
        }

        const persistedTicket = localStorage.getItem('currentFilterTicket');
        if (persistedTicket) {
            currentFilter.id_ticket = JSON.parse(persistedTicket);
        }
    });

    async function  resetFilter() {
        currentFilter = defFilter
        localStorage.removeItem('currentFilterStatus')
        localStorage.removeItem('currentFilterDate')
        localStorage.removeItem('currentFilterCategory')
        localStorage.removeItem('currentFilterTicket')
    }

    /**
     * Reads all filter states from localStorage and combines them into a single URL query string.
     * @param {string} segment The base URL segment (e.g., 'tickets', 'dashboard').
     */
    async function generateAndGoToQuery(segment) {
        // Use URLSearchParams for clean, encoded URL construction
        const params = new URLSearchParams();

        // 1. READ STATUS FILTER (Key = ID, Value = Name)
        const statusString = localStorage.getItem('currentFilterStatus');
        if (statusString) {
            try {
                const statusObj = JSON.parse(statusString);
                // The status ID is the KEY of the object (e.g., { '123': 'Active' } -> id='123')
                params.set('status', statusObj.id_ticket_status);
                
            } catch(e) { console.error("Error parsing status filter:", e); }
        }

        // 2. READ DATE FILTER (from, to)
        const dateString = localStorage.getItem('currentFilterDate');
        if (dateString) {
            try {
                const dateObj = JSON.parse(dateString);
                if (dateObj.from) {
                    params.set('from', dateObj.from);
                }
                if (dateObj.to) {
                    params.set('to', dateObj.to);
                }
            } catch(e) { console.error("Error parsing date filter:", e); }
        }

        // 3. READ CATEGORY/PRIORITY FILTER
        const categoryString = localStorage.getItem('currentFilterCategory');
        if (categoryString) {
            try {
                const categoryObj = JSON.parse(categoryString);
                // We assume 'priorityName' maps to a 'priority' URL param
                params.set('priority', categoryObj.id_priority);
                
            } catch(e) { console.error("Error parsing category filter:", e); }
        }

        // 3. READ CATEGORY/PRIORITY FILTER
        const ticketString = localStorage.getItem('currentFilterTicket');
        if (ticketString) {
            try {
                const ticketObj = JSON.parse(ticketString);
                // We assume 'priorityName' maps to a 'priority' URL param
                params.set('id_ticket', ticketObj.id_ticket);
                
            } catch(e) { console.error("Error parsing ticket filter:", e); }
        }

        // 4. CONSTRUCT and NAVIGATE
        const queryString = params.toString();
        
        const destination = `/${segment}${queryString ? '?' + queryString : ''}`;
        
        await goto(destination, { keepFocus: true, replaceState: true });
    }
    
</script>


<header class="bg-blue-50 shadow p-4 md:p-6 sticky top-0 z-10">
    <div class="flex items-center justify-between gap-4">
    <div class="relative flex-1 max-w-lg mx-auto">
      <input type="text" placeholder="Search tasks..." bind:value={ticket} class="w-full pl-5 pr-16 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 shadow-sm transition-shadow duration-200">
      <div class="absolute inset-y-0 right-0 flex items-center pr-3" role="presentation"
        onclick={async ()=>{
            const searchTicket = { id_ticket : ticket}
            currentFilter.id_ticket = searchTicket;
            localStorage.setItem('currentFilterTicket', JSON.stringify(searchTicket));
            openMenu = null;
            await generateAndGoToQuery(data.segment)
        }} 
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center text-xs font-semibold text-gray-600">
        <button onclick={ async () => {
                await resetFilter()
                await goto('/'+data.segment, { keepFocus: true, replaceState: true })
            }} class="relative p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none">
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
   
    {#if currentFilter.status}
        <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
            <span class="font-medium">Status:</span>
            {currentFilter.status.status_name}
        </div>    
    {/if}
    
    {#if currentFilter.date}
        <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
            <span class="font-medium">Date:</span>
            {currentFilter.date.from} - {currentFilter.date.to} 
        </div>    
    {/if}
    
    {#if currentFilter.category}
        <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
            <span class="font-medium">Priority:</span>
            {currentFilter.category.priority_name}
        </div>    
    {/if}
    

    {#if currentFilter.status || currentFilter.date || currentFilter.category}
        <div class="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-gray-100 text-gray-700">
            <button onclick={ async () => {
                await resetFilter()
                await goto('/'+data.segment, { keepFocus: true, replaceState: true })
            }}>
                <XCircle class="h-6 w-6" />
            </button>
        </div>
    {/if}
    
</div>
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
            class="fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-xl z-20 
                h-[85vh] flex flex-col" 
            in:slide={{ duration: 300, easing: quintOut }}
            out:slide={{ duration: 300 }}
        >  
            <div class="flex justify-between items-center px-4 pt-4 pb-2 border-b sticky top-0 bg-white z-10">
                <h3 class="text-xl font-bold text-gray-800">{$_('Notifications')}</h3>
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
    {:else}
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
                                onclick={async ()=>{
                                    currentFilter.status = status;
                                    localStorage.setItem('currentFilterStatus', JSON.stringify(status));
                                    openMenu = null;
                                    await generateAndGoToQuery(data.segment) 
                                } }
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
                        <button 
                        onclick={async ()=>{
                            const newDate = { from : fromDate , to : toDate}
                            currentFilter.date = newDate;
                            localStorage.setItem('currentFilterDate', JSON.stringify(newDate));
                            openMenu = null;
                            await generateAndGoToQuery(data.segment)
                            }} 
                            class="w-full mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
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
                                <button
                                onclick={async ()=>{
                                    currentFilter.category = priority;
                                    localStorage.setItem('currentFilterCategory', JSON.stringify(priority));
                                    openMenu = null;
                                    await generateAndGoToQuery(data.segment)
                                } } 
                                class="w-full text-left p-2 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
                                    {$_(priority.priority_name)}
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}

        </div>
    {/if}
    
{/if}
{@render children?.()}