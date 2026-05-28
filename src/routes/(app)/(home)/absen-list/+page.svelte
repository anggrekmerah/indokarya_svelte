<script>
  import { fade, fly } from 'svelte/transition'; // 
  import { t } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/state'; // SvelteKit runes untuk membaca URL aktif

  let { data } = $props();

  const now = new Date();
  let currentYear = now.getFullYear();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let prevMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(prevDate);

  // PERBAIKAN: Gunakan objek 'now' secara langsung dalam format()
  let currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now) 
  let selectedLog = $state(null);
  const monthsList = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  function handleMonthChange(event) {
    const month = event.target.value;
    // Menggunakan SvelteKit goto untuk refresh data tanpa reload halaman penuh
    goto(`?month=${month}`, { replaceState: true, keepFocus: true });
  }

  const getDayName = (dateStr) => {
    if (!dateStr) return 'Tidak Diketahui';
    const date = new Date(dateStr);
    // Cek apakah object date valid
    if (isNaN(date.getTime())) return 'Tidak Diketahui';
    
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '--/--';
    const date = new Date(dateStr);
    // Cek apakah object date valid
    if (isNaN(date.getTime())) return '--/--';

    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
    return `${day} ${month}`;
  };
  

  const generateFullMonthlyLogs = (serverData, targetMonth, targetYear) => {
    let logs = [];
    
    // Tentukan tahun dan bulan berdasarkan data yang dipilih dari server
    const currentYear = parseInt(targetYear, 10);
    const currentMonth = parseInt(targetMonth, 10) - 1; // 0-indexed untuk JS Date

    // Rentang periode: 26 bulan sebelumnya s/d 25 bulan ini
    const startDate = new Date(currentYear, currentMonth - 1, 26);
    const endDate = new Date(currentYear, currentMonth, 26);
    const now = new Date();

    let iterDate = new Date(startDate);
    let index = 0;

    // Lakukan looping day-by-day untuk membentuk 30 hari penuh
    while (iterDate <= endDate) {
      const year = iterDate.getFullYear();
      const month = String(iterDate.getMonth() + 1).padStart(2, '0'); 
      const day = String(iterDate.getDate()).padStart(2, '0'); 
      const dateString = `${year}-${month}-${day}`; // Format YYYY-MM-DD
      
      const dayName = getDayName(dateString);
      const isWeekend = dayName === 'Sabtu' || dayName === 'Minggu';
      
      // Cari apakah tanggal ini ada di dalam data dari database (MariaDB)
      // Kita cek record.date atau record.tanggal
      const record = serverData.find(d => (d.date === dateString || d.tanggal === dateString));
      
      if (record) {
        // JIKA DATA ADA DI DATABASE
        let statusDisplay = record.status_kehadiran || "MASUK";
        if (record.is_hari_libur || record.is_cuti_bersama) {
          statusDisplay = "LIBUR";
        } else if (record.is_terlambat) {
          statusDisplay = `TERLAMBAT (${record.terlambat_menit}m)`;
        }

        logs.push({
          id: record.id_rekap || record.id || `db-${index}`,
          date: formatDisplayDate(dateString),
          rawDate: dateString,
          day: dayName,
          checkIn: record.waktu_masuk ? record.waktu_masuk.substring(0, 5) : "--:--",
          checkOut: record.waktu_keluar ? record.waktu_keluar.substring(0, 5) : "--:--",
          status: statusDisplay,
          isLate: !!record.is_terlambat,
          isHoliday: !!(record.is_hari_libur || record.is_cuti_bersama),
          isValidIn: record.valid_masuk === 1,
          isValidOut: record.valid_keluar === 1,
          isData: true
        });
      } else {
        // JIKA DATA TIDAK ADA DI DATABASE (BUAT BARIS KOSONG / ABSENT)
        let displayStatus = "-";
        
        // Hanya beri status ABSENT/LIBUR jika tanggal tersebut sudah terlewati atau hari ini
        if (iterDate <= now) { 
          displayStatus = isWeekend ? $t("Libur") : $t("absent"); 
        }

        logs.push({
          id: `empty-${dateString}-${index}`,
          date: formatDisplayDate(dateString),
          rawDate: dateString,
          day: dayName,
          checkIn: "--:--",
          checkOut: "--:--",
          status: displayStatus,
          isLate: false,
          isHoliday: isWeekend,
          isValidIn: false,
          isValidOut: false,
          isData: false
        });
      }
      
      // Pindah ke hari berikutnya
      iterDate.setDate(iterDate.getDate() + 1);
      index++;
    }

    return logs;
  };

  let monthlyLogs = $derived(
    generateFullMonthlyLogs(
      data.monthlyAttendance?.data || [], 
      data.selectedMonth, 
      data.selectedYear
    )
  );

  const openDetail = (log) => {
    selectedLog = log;
  };
</script>

<main class="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
  <div class="max-w-2xl mx-auto px-4">
    
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">{$t('Riwayat Absensi')}</h1>
        <p class="text-slate-500 font-medium text-sm mt-0.5">
          Tahun Berjalan: {data.selectedYear}
        </p>
      </div>
      
      <div class="relative min-w-[160px]">
        <label for="month-filter" class="sr-only">Pilih Bulan</label>
        <select
          id="month-filter"
          value={data.selectedMonth}
          on:change={handleMonthChange}
          class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition-all"
        >
          {#each monthsList as m}
            <option value={m.value}>{m.label}</option>
          {/each}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      {#if monthlyLogs.length === 0}
        <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium">
          Tidak ada data rekam absensi pada bulan ini.
        </div>
      {:else}
        {#each monthlyLogs as log (log.id)}
          <button 
            on:click={() => openDetail(log)}
            class="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:border-slate-200 active:scale-[0.99]"
          >
            <div class="flex items-center gap-4">
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center min-w-[55px]">
                <p class="text-[10px] uppercase font-bold {log.day === 'Minggu' || log.day === 'Sabtu' ? 'text-rose-500' : 'text-slate-400'} leading-none">
                  {log.day.substring(0,3)}
                </p>
                <p class="text-lg font-black text-slate-700">{log.date.split(' ')[0]}</p>
              </div>
              
              <div>
                <div class="flex gap-3 items-center">
                  <div class="text-xs">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">{$t('In')}</span>
                    <span class="font-mono font-bold {log.isLate ? 'text-amber-500' : 'text-emerald-600'}">{log.checkIn}</span> 
                  </div>
                  <div class="h-6 w-[1px] bg-slate-100"></div> 
                  
                  <div class="text-xs">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">{$t('Out')}</span>
                    <span class="font-mono font-bold text-slate-600">{log.checkOut}</span> 
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider
                {log.isHoliday ? 'bg-rose-50 text-rose-600' : 
                 log.isLate ? 'bg-amber-50 text-amber-600' : 
                 log.status === 'MASUK' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}">
                {log.status}
              </span>
              
              <div class="text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </div>

  {#if selectedLog}
    <div 
      transition:fade={{ duration: 150 }}
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end justify-center"
      on:click={() => selectedLog = null}
      role="button"
      tabindex="-1"
    >
      <div 
        transition:fly={{ y: 300, duration: 300 }}
        class="bg-white w-full rounded-t-3xl p-8 pb-10 shadow-2xl max-w-lg"
        on:click|stopPropagation
        role="dialog"
      >
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
        
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">{selectedLog.date}</h2> 
            <p class="text-indigo-600 font-semibold">{selectedLog.day}</p>
          </div>
          <button on:click={() => selectedLog = null} class="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <p class="text-[10px] text-emerald-600 uppercase font-black mb-1">{$t('Check In')}</p>
            <p class="text-xl font-mono font-bold text-emerald-700">{selectedLog.checkIn}</p> 
            <span class="text-[9px] font-bold block mt-1 {selectedLog.isValidIn ? 'text-emerald-500' : 'text-rose-400'}">
              {selectedLog.isValidIn ? '✓ Valid Masuk' : '✕ Belum Validasi'}
            </span>
          </div>
          <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
            <p class="text-[10px] text-rose-600 uppercase font-black mb-1">{$t('Check Out')}</p>
            <p class="text-xl font-mono font-bold text-rose-700">{selectedLog.checkOut}</p> 
            <span class="text-[9px] font-bold block mt-1 {selectedLog.isValidOut ? 'text-emerald-500' : 'text-rose-400'}">
              {selectedLog.isValidOut ? '✓ Valid Keluar' : '✕ Belum Validasi'}
            </span>
          </div>
        </div>

        <div class="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs border border-slate-100">
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-400 font-bold">STATUS UTAMA</span>
            <span class="font-bold text-slate-700">{selectedLog.status}</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/60 pb-2">
            <span class="text-slate-400 font-bold">ID REKAP DATA</span>
            <span class="font-mono text-slate-600">#{selectedLog.id}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 font-bold">SABTU WAJIB</span>
            <span class="font-bold text-slate-600">TIDAK</span>
          </div>
        </div>

      </div>
    </div>
  {/if}
</main>