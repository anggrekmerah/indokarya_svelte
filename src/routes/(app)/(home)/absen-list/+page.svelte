<script>
  import { fade, fly } from 'svelte/transition'; // 

  let { data } = $props();

  const now = new Date();
  let currentYear = now.getFullYear();

  // PERBAIKAN: Gunakan objek 'now' secara langsung dalam format()
  let currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now) 
  let selectedLog = $state(null);

  const getDayName = (dayIndex) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[dayIndex];
  };

  const generateMonthlyLogs = (serverData) => {
    let logs = [];
    const now = new Date();
    const currentYear = now.getFullYear(); // Sesuai konteks sistem [cite: 2]
    const currentMonth = now.getMonth();    // Februari (0-indexed) [cite: 1]
    const today = now.getDate();

    // Mendapatkan jumlah hari dalam bulan ini
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const getDayName = (date) => {
        // PERBAIKAN: Gunakan 'long' (huruf kecil semua)
        return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
    };

    const getMonthName = (date) => {
        return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
    };
    let i = 1
    for (let e = 0; e <= daysInMonth; e++) {
        // Buat objek tanggal untuk setiap hari di bulan tersebut
        const dateObj = new Date(currentYear, currentMonth, i);
        
        // Format ISO lokal (YYYY-MM-DD) tanpa masalah timezone
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const dayName = getDayName(dateObj);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

        // Cari data server yang cocok dengan tanggal ini
        const record = serverData.find(d => d.date === dateString);

        if (record) {
            // Parsing koordinat "lat long" 
            const coords = record.check_in_location ? record.check_in_location.split(' ') : [null, null];

            logs.push({
                date: `${day} ${getMonthName(dateObj)}`,
                day: dayName,
                checkIn: record.check_in_time ? record.check_in_time.substring(0, 5) : "--:--", 
                checkOut: record.check_out_time ? record.check_out_time.substring(0, 5) : "--:--", 
                status: record.status, 
                lat: coords[0], 
                long: coords[1], 
                photo: record.check_in_photo ? record.check_in_photo.replace('./static', '') : null, 
                isData: true
            });
        } else {
            // Logika status jika tidak ada data absen
            let displayStatus = "-";
            if (i <= today) {
                displayStatus = isWeekend ? "Libur" : "absent";
            }

            logs.push({
                date: `${day} ${getMonthName(dateObj)}`,
                day: dayName,
                checkIn: "--:--",
                checkOut: "--:--",
                status: displayStatus,
                lat: null,
                long: null,
                photo: null,
                isData: false
            });
        }
        i++
    }
    return logs;
  };

  let monthlyLogs = generateMonthlyLogs(data.monthlyAttendance.data);

  const openDetail = (log) => {
    // Izinkan modal terbuka jika statusnya Hadir, Terlambat, 
    // atau jika log tersebut memiliki data (isData: true)
    if (log.isData || log.status === "present" || log.status === "late") {
      selectedLog = log;
    }
  };
</script>

<main class="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
  <div class="max-w-2xl mx-auto px-4">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Riwayat Absensi</h1>
      <p class="text-slate-500 font-medium">{currentMonth} {currentYear}</p>
    </div>

    <div class="space-y-3">
      {#each monthlyLogs as log}
        <button 
          on:click={() => openDetail(log)}
          class="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all"
        >
          <div class="flex items-center gap-4">
            <div class="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center min-w-[55px]">
              <p class="text-[10px] uppercase font-bold {log.day === 'Minggu' ? 'text-rose-500' : 'text-slate-400'} leading-none">
                {log.day.substring(0,3)}
              </p>
              <p class="text-lg font-black text-slate-700">{log.date.split(' ')[0]}</p>
            </div>
            
            <div>
                <div class="flex gap-3 items-center">
                  <div class="text-xs">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">In</span>
                    <span class="font-mono font-bold text-emerald-600">{log.checkIn}</span> 
                  </div>
                  <div class="h-6 w-[1px] bg-slate-100"></div> 
                  <div class="text-xs">
                    <span class="text-slate-400 block text-[10px] uppercase font-bold">Out</span>
                    <span class="font-mono font-bold text-slate-600">{log.checkOut}</span> 
                  </div>
                </div>
            </div>
          </div>

          {#if log.photo} 
            <div class="text-indigo-500 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  {#if selectedLog}
    <div 
      transition:fade={{ duration: 150 }}
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end justify-center"
      on:click={() => selectedLog = null}
    >
      <div 
        transition:fly={{ y: 300, duration: 300 }}
        class="bg-white w-full rounded-t-[0.5rem] p-8 pb-10 shadow-2xl max-w-lg"
        on:click|stopPropagation
      >
        <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">{selectedLog.date} {currentMonth}</h2> 
            <p class="text-indigo-600 font-semibold">{selectedLog.day}</p>
          </div>
          <button on:click={() => selectedLog = null} class="p-2 bg-slate-50 rounded-full text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="relative group mb-8">
            <img src={selectedLog.photo} alt="Bukti Foto" class="w-full h-48 object-cover rounded-3xl shadow-inner border-4 border-slate-50" /> 
            <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">📸 Selfie Check-in</div> 
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <p class="text-[10px] text-emerald-600 uppercase font-black mb-1">Check In</p>
            <p class="text-xl font-mono font-bold text-emerald-700">{selectedLog.checkIn}</p> 
          </div>
          <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
            <p class="text-[10px] text-rose-600 uppercase font-black mb-1">Check Out</p>
            <p class="text-xl font-mono font-bold text-rose-700">{selectedLog.checkOut}</p> 
          </div>
        </div>
        <div class="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl mb-8">
          <div class="bg-indigo-100 p-3 rounded-xl text-indigo-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="10" r="3" stroke-width="2" />
            </svg>
          </div>
          
          <div class="min-w-0 flex-1">
            <p class="text-[10px] text-slate-400 uppercase font-black leading-none mb-1">Lokasi GPS</p>
            <p class="text-sm text-slate-700 font-mono font-bold break-all">
              {selectedLog.lat}, {selectedLog.long}
            </p>
          </div>
        </div>
        </div>
    </div>
  {/if}
</main>