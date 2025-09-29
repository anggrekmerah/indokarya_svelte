<script>
    import {_} from 'svelte-i18n'
    export let ticket
</script>
<div class="bg-gray-200 p-6 mb-2 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"> 
    <h4 class="text-md font-bold text-gray-500 mb-2">#{ticket.id_ticket}  
    <span class="inline-flex items-center rounded-full bg-gray-300 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-600/20">
        {$_(ticket.priority_name)}
    </span>
    <span class="inline-flex items-center rounded-full bg-gray-300 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
        {$_(ticket.status_name)}
    </span>
    </h4>
    <h3 class="text-md font-bold text-gray-500 mb-2">{ticket.ticket_tittle}</h3>
    <p class="text-sm text-gray-600 mb-6">{ticket.ticket_description}</p>

    <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div class="flex items-center">
            <img
            class="h-8 w-8 rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
            src="https://placehold.co/32x32/gray/ffffff?text={ticket.cust_name[0]}"
            alt="User avatar"
            />
            <span class="ml-2 font-medium text-gray-500">{ticket.cust_name}</span>
        </div>
    </div>
    <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
            </svg>
            <span class="text-[10px] text-gray-600">{ticket.created_datetime}</span>
        </div>
    </div>
</div>