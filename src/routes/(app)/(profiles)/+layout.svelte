<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { children } = $props();

    // State variables for each menu's open/close state
    let openMenu = $state(null); // 'status', 'date', or 'category'

    // Status menu data
    const statuses = ['Edit Profile'];


    /**
     * Toggles the state of the menus.
     * @param {string} menuName - The name of the menu to toggle.
     */
    function toggleMenu() {
        openMenu = true;
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
        <!-- Header Section -->
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 sm:space-x-6">
                <!-- Profile Photo -->
                <div class="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md ring-2 ring-indigo-500">
                    <!-- <img class="w-full h-full object-cover" src="https://placehold.co/100x100/A5B4FC/FFFFFF?text=User" alt="Profile Photo"> -->
                    <img
                    class="w-full h-full object-cover rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
                    src="https://placehold.co/32x32/1e40af/ffffff?text=JD"
                    alt="User avatar"
                    />
                </div>
                <!-- Name -->
                <div class="text-left">
                    <h1 class="text-xl sm:text-3xl font-bold text-gray-800">John Doe</h1>
                    <p class="text-xs sm:text-sm text-gray-500">Administrator</p>
                </div>
            </div>
            <!-- Settings Icon -->
            <button onclick={() => toggleMenu()} class="text-gray-400 hover:text-gray-600 transition duration-300 transform hover:scale-110 p-2">
                <svg class="w-6 h-6 mb-1"  fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"/></svg>
            </button>
        </div>
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
        
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Setting Profile</h3>
            <ul class="space-y-2 text-sm">
                {#each statuses as status}
                    <li>
                        <button class="w-full text-left p-3 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
                            {status}
                        </button>
                    </li>
                {/each}
                <li>
                    <form action="/login?/logout" method="POST" use:enhance class="flex justify-center">
                        <button
                            type="submit"
                            class="w-full text-left p-3 rounded-md hover:bg-gray-100 border-2 border-x-transparent border-t-transparent border-b-grey-500">
                            Log Out
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    
    </div>
{/if}
{@render children?.()}