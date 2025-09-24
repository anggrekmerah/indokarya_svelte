<script>
    import {_} from 'svelte-i18n'
</script>

<div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg relative">
    <h4 class="text-md font-bold text-gray-900 mb-2">#{$_('ticket')}
        <span class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
            {$_('ticket')}
        </span>
        <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {$_('ticket')}
        </span>
    </h4>
    <h3 class="text-md font-bold text-gray-900 mb-2">{$_('ticket')}</h3>
    <p class="text-sm text-gray-600 mb-6">{$_('ticket')}</p>

    <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div class="flex items-center">
            <img
                class="h-8 w-8 rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
                src="https://placehold.co/32x32/1e40af/ffffff?text={$_('ticket')}"
                alt="User avatar"
            />
            <span class="ml-2 font-medium text-gray-700">{$_('ticket')}</span>
        </div>
        <div class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
            </svg>
            <span class="text-[10px] text-gray-600">{$_('ticket')}</span>
        </div>
    </div>

    <!-- Locked Overlay with Button -->
    <div id="locked-overlay" class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.243 2 7 4.243 7 7v4H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v4H9V7a3 3 0 013-3z"/>
        </svg>
        <!-- <button onclick={() => {onTogglePopup(ticket.id_ticket)}} class="flex items-center space-x-2 px-6 py-3 bg-white text-gray-800 font-bold rounded-full shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
            <span>{$_('Unlock')}</span>
        </button> -->
    </div>
</div>