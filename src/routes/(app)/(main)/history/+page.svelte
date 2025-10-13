<script>
    import { _ } from 'svelte-i18n';
    import TicketUnlockHistory from '$lib/components/TicketUnlockHistory.svelte'

  // Get data from the load function
    let { data } = $props();

</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">

        {#if data.listTicket}
            {#each data.listTicket as ticket}
        
                <TicketUnlockHistory ticket={ticket} />
        
            {/each}
        {/if}

    </div>
</main>


