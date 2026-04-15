<script>
    import { CheckCircle2, AlertCircle } from 'lucide-svelte';
    import { t } from 'svelte-i18n';

    let { attr = $bindable() } = $props();

    if (attr.is_manual === undefined) attr.is_manual = 'N';

    const isEmptyValue = $derived(
        attr.attribute_value === null ||
        attr.attribute_value === undefined ||
        String(attr.attribute_value).trim() === ''
    );

    const isValid = $derived(
        attr.is_required === 'Y'
            ? (!isEmptyValue && (attr.data_type === 'boolean' ? attr.attribute_value === 'Y' : true))
            : !isEmptyValue
    );

    const isError = $derived(attr.is_required === 'Y' && !isValid);

    function handleToggle() {
        attr.attribute_value = attr.attribute_value === 'Y' ? 'N' : 'Y';
        attr.is_manual = 'Y';
    }

    function handleTyping() {
        attr.is_manual = 'Y';
    }
</script>

<div class="w-full bg-white rounded-lg border p-3 flex flex-col gap-2
    {isError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}">

    <input type="hidden" name="attr_real_id" value={attr.id_attr} />

    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-800">
                {attr.attribute_name}
            </span>

            {#if attr.is_required === 'Y'}
                <span class="text-red-500 text-xs font-bold">*</span>
            {/if}

            {#if attr.is_manual === 'Y'}
                <span class="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {$t('manual')}
                </span>
            {/if}
        </div>

        <div>
            {#if isValid}
                <CheckCircle2 size={18} class="text-emerald-500" />
            {:else if isError}
                <AlertCircle size={18} class="text-rose-500" />
            {/if}
        </div>
    </div>

    <div class="text-[10px] text-slate-500 uppercase font-bold">
        {$t(attr.data_type.toLowerCase())}
    </div>

    {#if attr.data_type === 'boolean'}
        <div class="flex gap-3 mt-1">
            <button
                type="button"
                onclick={handleToggle}
                class="flex-1 py-2 rounded-lg text-sm font-semibold transition
                {attr.attribute_value === 'Y'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-700'}"
            >
                {$t('ya')}
            </button>

            <button
                type="button"
                onclick={handleToggle}
                class="flex-1 py-2 rounded-lg text-sm font-semibold transition
                {attr.attribute_value === 'N'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 text-slate-700'}"
            >
                {$t('tidak')}
            </button>
        </div>
    {:else}
        <input
            type="text"
            bind:value={attr.attribute_value}
            oninput={handleTyping}
            placeholder={$t('input_placeholder')}
            class="w-full border rounded-lg px-3 py-2 text-sm outline-none
            {isError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 focus:border-blue-500'}"
        />
    {/if}
</div>