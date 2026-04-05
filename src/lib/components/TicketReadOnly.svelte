<script>
    export let ticket
</script>
<div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
    <div class="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
        <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            #{ticket.id_ticket || 'N/A'}
        </span>
        <span class="text-[10px] font-medium text-gray-500 uppercase">
            {ticket.status_name || '-'}
        </span>
    </div>

    <div class="space-y-2">
        <div class="flex flex-col">
            <span class="text-[9px] uppercase text-gray-400 font-semibold tracking-tight">Nama PIC</span>
            <span class="text-xs font-medium text-gray-700">{ticket.pic_name || 'Tidak ada PIC'}</span>
        </div>
        
        <div class="flex flex-col">
            <span class="text-[9px] uppercase text-gray-400 font-semibold tracking-tight">Tanggal Efektif</span>
            <span class="text-xs font-medium text-gray-700">{ticket.assigned_date || '-'}</span>
        </div>
    </div>
</div>