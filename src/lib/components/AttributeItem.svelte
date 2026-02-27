<script>
    import { CheckCircle2, AlertCircle } from 'lucide-svelte';
    let { attr = $bindable() } = $props();

    // Inisialisasi status awal jika belum ada 
    if (attr.is_manual === undefined) attr.is_manual = 'N';

    const hasInitialValue = attr.attribute_value !== null && 
                          attr.attribute_value !== undefined && 
                          String(attr.attribute_value).trim() !== ''; 

    const isEmptyValue = $derived(
        attr.attribute_value === null || 
        attr.attribute_value === undefined || 
        String(attr.attribute_value).trim() === ''
    ); 

    // Logika Locked: Boolean locked jika sudah 'Y'. Teks locked jika sudah ada isi.
    const isLocked = $derived(
        attr.data_type === 'boolean' ? (hasInitialValue && attr.attribute_value === 'Y') : hasInitialValue
    ); 

    const isValid = $derived(
        attr.is_required === 'Y' 
            ? (!isEmptyValue && (attr.data_type === 'boolean' ? attr.attribute_value === 'Y' : true))
            : !isEmptyValue
    ); 

    const isError = $derived(attr.is_required === 'Y' && !isValid); 

    // Handler interaksi
    function handleToggle() {
        if (isLocked) return;
        attr.attribute_value = attr.attribute_value === 'Y' ? 'N' : 'Y';
        attr.is_manual = 'Y'; // Tandai sebagai manual saat diklik
    }

    function handleTyping() {
        if (!hasInitialValue) {
            attr.is_manual = 'Y'; // Tandai sebagai manual saat mengetik di kolom kosong
        }
    }
</script>

<div class="group w-full bg-white px-4 py-2 flex flex-col gap-1 border-b border-slate-50 hover:bg-slate-50/80 transition-all {isError ? 'bg-rose-50/20' : ''}">
    <input type="hidden" name="attr_real_id" value={attr.id_attr} />
    <div class="flex items-center gap-1.5">
        <span class="text-[12px] font-bold text-slate-700">
            {attr.attribute_name} 
            {#if attr.is_manual === 'Y'}
                <span class="text-[9px] text-blue-500 font-normal ml-1">(Manual)</span>
            {/if}
        </span>
        {#if attr.is_required === 'Y'} 
            <span class="text-rose-500 text-[10px] font-bold">*</span>
        {/if}
    </div>

    <div class="flex items-center gap-2">
        <span class="shrink-0 text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase border border-slate-200/50">
            {attr.data_type}
        </span>

        <div class="flex-1 flex items-center gap-2">
            {#if attr.data_type === 'boolean'}
                <button 
                    type="button"
                    onclick={handleToggle}
                    class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                    {attr.attribute_value === 'Y' ? 'bg-emerald-500' : 'bg-slate-200'} 
                    {isLocked ? 'opacity-50 cursor-not-allowed' : ''}"
                >
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out 
                    {attr.attribute_value === 'Y' ? 'translate-x-5' : 'translate-x-0'}"></span>
                </button>
                <span class="text-[10px] font-bold {attr.attribute_value === 'Y' ? 'text-emerald-600' : 'text-slate-400'}">
                    {attr.attribute_value === 'Y' ? 'YA' : 'TIDAK'}
                </span>
            {:else}
                <input 
                    bind:value={attr.attribute_value} 
                    oninput={handleTyping}
                    type="text"
                    placeholder="Input manual..."
                    readonly={isLocked}
                    class="flex-1 min-w-0 bg-white border rounded-md px-2 py-1 text-[11px] outline-none transition-all
                    {isError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'} 
                    {isLocked ? 'bg-slate-50 text-slate-400 cursor-not-allowed italic' : 'focus:border-indigo-400'}" 
                />
            {/if}

            <div class="w-5 flex justify-center">
                {#if isValid} 
                    <CheckCircle2 size={15} class="text-emerald-500" />
                {:else if isError}
                    <AlertCircle size={15} class="text-rose-400" />
                {:else}
                    <div class="w-1 h-1 rounded-full bg-slate-200"></div>
                {/if}
            </div>
        </div>
    </div>
</div>