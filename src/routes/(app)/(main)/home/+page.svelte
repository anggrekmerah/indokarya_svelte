<script>

    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n';
    import { ioClient } from '$lib/stores/socket.js';
    import TicketUnlock from '$lib/components/TicketUnlock.svelte'
    import TicketLock from '$lib/components/TicketLock.svelte'

  // Get data from the load function
    let { data } = $props();

    let messages = $state([]);
    
    onMount(() => {

        if (ioClient) {
            console.log('Socket available. Attaching listener...');
            // socket.emit('join_user_room', 5);

            ioClient.on('ticket', (newData) => {
                messages.push(newData)
                console.log('New message received:', newData);
            });
        }
        
    });

</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">

        {#if data.listTicket}
            {#each data.listTicket as ticket}
                {#if ticket.ticket_priority_lock == 'N'}
                    <TicketUnlock ticket={ticket} />
                {:else}
                    <TicketLock ticket={ticket} />
                {/if}
            {/each}
        {/if}

        {#each messages as msg}
            {#if msg.ticket_priority_lock == 'N'}
                <TicketUnlock ticket={msg} />
            {:else}
                <TicketLock ticket={msg} />
            {/if}
        {/each}

    </div>
</main>


