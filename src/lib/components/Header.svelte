<!-- src/components/WorkModeSelector.svelte -->
<script>
  let { data, currentPath } = $props();

  // Logika penentuan judul berdasarkan path
  const getPageDetails = (path) => {
      if (path === '/home') return { title: 'Beranda', subtitle: 'HR Dashboard' };
      if (path === '/cuti') return { title: 'Pengajuan Cuti', subtitle: 'Pengajuan Cuti' }; 
      if (path === '/absen-list') return { title: 'Riwayat Absensi', subtitle: 'Februari 2026' };
      return { title: 'Aplikasi', subtitle: 'HR Portal' };
  };

  // Gunakan $derived untuk mengikuti perubahan path secara otomatis
  let pageInfo = $derived(getPageDetails(currentPath));
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
  <div class="max-w-4xl mx-auto flex justify-between items-center">
    <div>
      <h1 class="text-lg font-black text-slate-800 leading-tight">{pageInfo.title}</h1>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
        Mode: <span class="text-indigo-600">{data.users.work_base}</span>
      </p>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right  sm:block">
        <p class="text-xs font-bold text-slate-700">{data.users.name}</p>
        <p class="text-[10px] text-slate-400">{data.group}</p>
      </div>
      <div class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 text-lg">
        <img
        class="w-full h-full object-cover rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
        src="https://placehold.co/32x32/1e40af/ffffff?text={data.users.name.substring(0, 2).toUpperCase()}"
        alt="User avatar"
        />
      </div>
    </div>
  </div>
</header>