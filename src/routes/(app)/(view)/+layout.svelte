<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { _ } from 'svelte-i18n';
    
    let { data, children } = $props();

    // State variables for each menu's open/close state
    let openMenu = $state(null); // 'status', 'date', or 'category'

    // Status menu data
    const statuses = [
        {title : 'Profile', url:'profile', svg : 'M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z'}
        ,{title : 'Change Password', url:'changepassword', svg : 'M400 416C497.2 416 576 337.2 576 240C576 142.8 497.2 64 400 64C302.8 64 224 142.8 224 240C224 258.7 226.9 276.8 232.3 293.7L71 455C66.5 459.5 64 465.6 64 472L64 552C64 565.3 74.7 576 88 576L168 576C181.3 576 192 565.3 192 552L192 512L232 512C245.3 512 256 501.3 256 488L256 448L296 448C302.4 448 308.5 445.5 313 441L346.3 407.7C363.2 413.1 381.3 416 400 416zM440 160C462.1 160 480 177.9 480 200C480 222.1 462.1 240 440 240C417.9 240 400 222.1 400 200C400 177.9 417.9 160 440 160z'}
    ];


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
                    src="https://placehold.co/32x32/1e40af/ffffff?text={data.users.name.substring(0, 2).toUpperCase()}"
                    alt="User avatar"
                    />
                </div>
                <!-- Name -->
                <div class="text-left">
                    <h1 class="text-xl sm:text-3xl font-bold text-gray-800">{data.users.name}</h1>
                    <p class="text-xs sm:text-sm text-gray-500">{data.group}</p>
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
        class="fixed inset-0 bg-black opacity-50 z-10"
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
            <h3 class="text-lg font-semibold mb-4">{$_('Setting Profile')}</h3>
            <ul class="space-y-2 text-sm">
                {#each statuses as status}
                    <li class="border-2 border-x-transparent border-t-transparent border-b-grey-500" onclick={closeMenu}>
                        <a href="/{status.url}" class="flex w-full text-left p-3 rounded-md hover:bg-gray-100 space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="h-5 w-5 fill-current text-gray-700">
                                <path d="{status.svg}"/></svg>
                            <span>{$_(status.title)}</span>
                        </a>
                    </li>
                {/each}
                <li class="border-2 border-x-transparent border-t-transparent border-b-grey-500" onclick={ () => { closeMenu()} }>
                    <button class="flex w-full text-left p-3 rounded-md hover:bg-gray-100 space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="h-5 w-5 fill-current text-gray-700"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M415.9 344L225 344C227.9 408.5 242.2 467.9 262.5 511.4C273.9 535.9 286.2 553.2 297.6 563.8C308.8 574.3 316.5 576 320.5 576C324.5 576 332.2 574.3 343.4 563.8C354.8 553.2 367.1 535.8 378.5 511.4C398.8 467.9 413.1 408.5 416 344zM224.9 296L415.8 296C413 231.5 398.7 172.1 378.4 128.6C367 104.2 354.7 86.8 343.3 76.2C332.1 65.7 324.4 64 320.4 64C316.4 64 308.7 65.7 297.5 76.2C286.1 86.8 273.8 104.2 262.4 128.6C242.1 172.1 227.8 231.5 224.9 296zM176.9 296C180.4 210.4 202.5 130.9 234.8 78.7C142.7 111.3 74.9 195.2 65.5 296L176.9 296zM65.5 344C74.9 444.8 142.7 528.7 234.8 561.3C202.5 509.1 180.4 429.6 176.9 344L65.5 344zM463.9 344C460.4 429.6 438.3 509.1 406 561.3C498.1 528.6 565.9 444.8 575.3 344L463.9 344zM575.3 296C565.9 195.2 498.1 111.3 406 78.7C438.3 130.9 460.4 210.4 463.9 296L575.3 296z"/></svg>
                        <span>
                            {#if data.userLang === 'en'}
                                Change language To ID
                            {:else}
                                Change language To EN
                            {/if}
                        </span>
                    </button>
                </li>
                <li class="border-2 border-x-transparent border-t-transparent border-b-grey-500"> 
                    <form action="/login?/logout" method="POST" use:enhance class="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100">
                        <button type="submit" class="flex items-center space-x-2 w-full text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="h-5 w-5 fill-current text-gray-700">
                                <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z"/>
                            </svg>
                            <span>{$_('Log Out')}</span>
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    
    </div>
{/if}
{@render children?.()}