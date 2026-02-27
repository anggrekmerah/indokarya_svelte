<script>
    import { fade, fly } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { tick } from 'svelte';
    import { onMount, onDestroy } from 'svelte';
        
    let { data } = $props();

    // State untuk data list pengajuan (Simulasi hasil Join tabel transaksi & master)
    let leaveSubmissions = $state([]);
    let activeFilter = $state('Semua');
    let page = $state(1);
    let isLoadingMore = $state(false);
    let hasMoreData = $state(true);
    let isError = $state(false);

    let showForm = $state(false);
    let isSubmitting = $state(false);
    let responseMessage = $state("");
    let selectedLeaveId = $state(""); 

    // Gunakan $derived untuk mencari detail cuti yang dipilih secara otomatis
    let selectedLeaveDetail = $derived(
        data.allLeaves.find(l => l.id == selectedLeaveId)
    );

    // Fungsi pembantu warna status
    const getStatusColor = (status) => {
    switch (status) {
        case 'Disetujui': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'Ditolak': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-slate-50 text-slate-600';
        }
    };


    // Filter reaktif (Client-side filter untuk data yang sudah ter-load)
    let filteredSubmissions = $derived(
        activeFilter === 'Semua' 
        ? leaveSubmissions 
        : leaveSubmissions.filter(item => item.status === activeFilter)
    );

        async function fetchLeaves(targetPage, targetStatus, isAppend = false) {
            isLoadingMore = true;
            try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                page: targetPage, 
                limit: 5,
                status: targetStatus === 'Semua' ? null : targetStatus
                })
            });

            if (!res.ok) throw new Error();
            const newData = await res.json();

            if (newData.length < 5) {
                hasMoreData = false;
            }

            if (isAppend) {
                leaveSubmissions = [...leaveSubmissions, ...newData];
            } else {
                leaveSubmissions = newData;
            }
            
            isError = false;
        } catch (err) {
        isError = true;
        hasMoreData = false;
        } finally {
        isLoadingMore = false;
        }
    }

    async function changeFilter(status) {
        activeFilter = status;
        page = 1;
        hasMoreData = true;
        // Ambil data baru (replace list)
        await fetchLeaves(1, status, false);
        
        // Cek jika layar masih kosong karena data sedikit
        await tick();
        if (hasMoreData && document.documentElement.scrollHeight <= window.innerHeight) {
        loadMore();
        }
    }

    async function loadMore() {
        if (isLoadingMore || !hasMoreData || isError) return;
        page += 1;
        // Tambah data ke list yang sudah ada (append)
        await fetchLeaves(page, activeFilter, true);
    }

    onMount( async () => {
        leaveSubmissions = data.initialSubmissions || []
    })

    // Trigger loadMore pertama kali jika data awal (page 1) tidak cukup memenuhi layar
    $effect(() => {
        if (leaveSubmissions.length > 0 && document.documentElement.scrollHeight <= window.innerHeight) {
            loadMore();
        }
    });

    // Event Listener Scroll
    $effect(() => {
        const onScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMore();
        }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    });
</script>

<main class="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
      
    <div class="flex justify-between items-center ">
        
        <button 
        onclick={() => showForm = true}
        class="fixed bottom-20 right-4 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-2xl shadow-indigo-300 transition-all active:scale-90 flex items-center gap-2 group"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-sm font-bold pr-1"></span>
        </button>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {#each ['Semua', 'pending', 'rejected', 'approved'] as status}
            <button 
                onclick={() => changeFilter(status)} 
                class="px-3 py-3 rounded-full border text-xs font-bold transition-all
                {activeFilter === status 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white border-slate-200 text-slate-600'}"
            >
                {status}
            </button>
        {/each}
    </div>

    <div class="space-y-4">
        {#each leaveSubmissions as item }
            <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center border border-indigo-100">
                        <span class="text-lg font-bold mt-1">{item.durasi}</span> 
                        <span class="text-[8px] font-bold uppercase">Hari</span> 
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800">{item.nama} ({item.kode})</h3>
                        <p class="text-xs text-slate-400">{item.rentang} • {item.alasan}</p>
                    </div>
                </div>
                <div class="px-3 py-1.5 rounded-full border text-[10px] font-black uppercase {getStatusColor(item.status)}">
                    {item.status} 
                </div>
            </div>
        {/each}

        {#if isLoadingMore}
            <div class="text-center p-4 text-slate-400 text-xs animate-pulse font-bold">
                MENGAMBIL DATA...
            </div>
        {/if}

        {#if isError}
            <div class="text-center py-4">
                <p class="text-rose-500 text-xs font-bold mb-2">GAGAL MEMUAT DATA</p>
                <button 
                    onclick={() => { isError = false; loadMore(); }}
                    class="bg-slate-200 px-4 py-2 rounded-full text-[10px] font-black uppercase"
                >
                    Coba Lagi
                </button>
            </div>
        {/if}

        {#if !hasMoreData && leaveSubmissions.length > 0}
            <div class="text-center py-8 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                Semua data {activeFilter} telah ditampilkan
            </div>
        {:else if !isLoadingMore && leaveSubmissions.length === 0}
            <div class="text-center py-20 text-slate-400 text-xs font-bold">
                TIDAK ADA DATA {activeFilter.toUpperCase()}
            </div>
        {/if}
    </div>

{#if showForm}
  <div 
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center"
    role="button"
    aria-label="Tutup latar belakang"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && (showForm = false)}
  >
    <div 
      transition:fly={{ y: 500, duration: 400 }}
      class="bg-white w-full max-w-lg rounded-t-[0.5rem] p-8 shadow-2xl cursor-auto"
      role="dialog"
      aria-modal="true"
    >

        <button 
            type="button"
            onclick={() => (showForm = false)}
            class="absolute right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors group"
            aria-label="Tutup form"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      
      <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
      
      <h2 class="text-2xl font-black text-slate-800 mb-6 text-left">Form Pengajuan</h2>
      
      <form 
        method="POST" 
        action="?/ajukanCuti" 
        use:enhance={() => {
            isSubmitting = true; 
            return async ({ result, update }) => {
            if (result.type === 'success') { 
                showForm = false; 
                // Opsional: Reset data dan ambil ulang page 1 agar data terbaru muncul di paling atas
                page = 1;
                const refreshRes = await fetch('/api/leaves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ page: 1, limit: 10 })
                });
                leaveSubmissions = await refreshRes.json();
                await update(); 
            }
            isSubmitting = false; 
            };
        }}
        >
        <div class="space-y-4 mb-8 text-left">
          {#if responseMessage}
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-500 uppercase text-center">
              {responseMessage} 
            </div>
          {/if}

          <div class="grid grid-cols-1 gap-4">
            <label for="jenis_cuti" class="text-[10px] font-black uppercase text-slate-400 ml-1 block">Jenis Cuti</label> 
            <select 
            id="jenis_cuti"
            name="jenis_cuti_id" 
            bind:value={selectedLeaveId}
            required 
            class="block bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
            {#each data.allLeaves as leave} 
                <option value="{leave.id}">{leave.nama_cuti} ({leave.kode_cuti})</option>
            {/each}
            </select>

            {#if selectedLeaveDetail}
                <div 
                    transition:fade 
                    class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-3 items-start"
                >
                    <div class="bg-indigo-600 p-1.5 rounded-lg text-white mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                            Ketentuan {selectedLeaveDetail.nama_cuti}
                        </p>
                        <p class="text-xs text-indigo-700 leading-relaxed">
                            {selectedLeaveDetail.deskripsi || "Tidak ada ketentuan khusus untuk jenis cuti ini."}
                        </p>
                        {#if selectedLeaveDetail.maksimal_cuti}
                            <div class="mt-2 inline-block bg-white px-2 py-1 rounded-md border border-indigo-200 text-[10px] font-bold text-indigo-600">
                                MAKSIMAL: {selectedLeaveDetail.maksimal_cuti} HARI
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="mulai" class="text-[10px] font-black uppercase text-slate-400 ml-1 block">Mulai</label> 
              <input id="mulai" type="date" name="tanggal_mulai" required class="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold text-slate-700" />
            </div>
            <div>
              <label for="selesai" class="text-[10px] font-black uppercase text-slate-400 ml-1 block">Selesai</label> 
              <input id="selesai" type="date" name="tanggal_selesai" required class="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold text-slate-700" />
            </div>
          </div>

          <div>
            <label for="alasan" class="text-[10px] font-black uppercase text-slate-400 ml-1 block">Alasan</label> 
            <textarea id="alasan" name="alasan" required rows="3" class="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 font-bold text-slate-700" placeholder="Ketik alasan cuti..."></textarea>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'} 
        </button>
      </form>
    </div>
  </div>
{/if}

</main>
