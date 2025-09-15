<script>
    let { data, children } = $props();

    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { _ } from 'svelte-i18n';

    // State variables for each menu's open/close state
    let openMenu = $state(null); // 'status', 'date', or 'category'

    // Status menu data
    const statuses = ['All', 'Open', 'Assigned', 'Closed', 'Pending', 'In progress', 'Canceled'];

    // Date menu state
    let fromDate = $state('');
    let toDate = $state('');

    // Category menu data
    const categories = ['Low', 'Medium', 'Urgent'];

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
    
</script>


<header class="bg-white shadow p-4 md:p-6 sticky top-0 z-10">
    <div class="mb-4 md:mb-0">
        <input type="text" placeholder="Search tasks..." class="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>

    <div class="flex justify-between items-center text-sm md:text-base mt-2 md:mt-4">
        <button onclick={() => toggleMenu('status')} class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
            <span class="block">Status</span>
        </button>
        <button onclick={() => toggleMenu('date')} class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
            <span class="block">{$_('Date')}</span>
        </button>
        <button onclick={() => toggleMenu('category')} class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
            <span class="block">{$_('Category')}</span>
        </button>
    </div>
</header>
{#if openMenu}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 z-10"
        onclick={closeMenu}
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
        role="none"
    ></div>

    <div
        class="fixed bottom-0 left-0 right-0 bg-white shadow-xl p-4 rounded-t-lg z-20 max-h-[200vh] overflow-y-auto h-3/4"
        in:slide={{ duration: 300, easing: quintOut }}
        out:slide={{ duration: 300 }}
    >
        {#if openMenu === 'status'}
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">{$_('Select Status')}</h3>
                <ul class="space-y-2 text-sm">
                    {#each data.dataTicketStatus as status}
                        <li>
                            <button class="w-full text-left p-3 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
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