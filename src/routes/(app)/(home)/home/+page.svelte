<script>
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { fade, fly, slide } from 'svelte/transition';
  import { 
    Calendar, 
    Clock, 
    UserCheck, 
    Briefcase, 
    TrendingUp, 
    PieChart ,
    ChevronRight ,
    MapPin
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Loader } from '@googlemaps/js-api-loader';
  import { onMount } from 'svelte';

  let { data } = $props();
  
  let baseStats = {
    office: [
      { label: 'Efisiensi Kerja', value: '94%', color: 'text-green-600' },
      { label: 'Rapat Hari Ini', value: '3 Sesi', color: 'text-blue-600' },
      { label: 'Sisa Cuti', value: '12 Hari', color: 'text-gray-800' }
    ],
    technician: [
        { 
            label: 'Tiket Selesai', 
            value: `${data.data_totalClosed?.total || 0}`, 
            color: 'text-green-600' 
        },
        { 
            label: 'Tiket Open', 
            value: `${data.data_totalOpen?.total || 0}`, 
            color: 'text-orange-600' 
        },
        { 
            label: 'Status Absen', 
            value: data.checkTodayAttendance ? 'Sudah Hadir' : 'Belum Absen', 
            color: data.checkTodayAttendance ? 'text-blue-600' : 'text-red-600' 
        }
    ],
    hybrid: [
      { label: 'Status Tim', value: '4 Online', color: 'text-green-600' },
      { label: 'Jadwal Besok', value: 'Lapangan', color: 'text-purple-600' },
      { label: 'Sisa Cuti', value: '10 Hari', color: 'text-gray-800' }
    ]
  };


  let work_base = data.users.work_base;
  let google
  let isInOfficeArea = $state(true);
  let hybridMode = $state(null);
  let isInRange = $state(true);
  
  let hasCheckedIn = $derived(!!data.checkTodayAttendance?.data); 
  let totalAtt = $derived(data.attendances?.data); 
  
  // Gunakan $derived untuk mode hybrid agar konsisten dengan data server
  let hybridModeServer = $derived(data.checkTodayAttendance?.data?.attendance_mode || null);
  
  console.log('hybridModeServer', hybridModeServer)
  const currentStats = baseStats[work_base] || [];
  
  // State variables
  let isSubmitting = $state(false);
  let in_showPopup = $state(false);
  let in_photoTaken = $state(false);
  let in_photoPreviewUrl = $state('https://placehold.co/150x150/e2e8f0/64748b?text=Photo');
  
  let in_videoElement = $state(null); 
  let in_canvasElement = $state(null); 
  let in_stream = $state(null);
  let in_capturedFile = $state(null); // Menyimpan objek File
  let in_cameraFacingMode = $state('user');
  let locationData = $state({ lat: null, long: null });
  let responseMessage = $state(null);

  const mapsConf = {
      apiKey:data.mapsKey,
      mapIds:data.mapsId,
      version: 'weekly',
      libraries: ['maps','marker','places','routes','geometry'] // 'places' is often needed for directions 
  };
  console.log('mapsConf home')

  let mapsLoader;
    if (typeof window !== 'undefined') {
        mapsLoader = new Loader(mapsConf);
    }
  
  $effect(() => {
      if (hybridModeServer) {
          hybridMode = hybridModeServer;
      }
  });

  onMount(async () => {
      // Tunggu core SDK selesai
      const googleInstance = await mapsLoader.load();
      
      // WAJIB: Tunggu library geometry selesai dimuat secara eksplisit
      await googleInstance.maps.importLibrary('geometry'); 
      
      google = googleInstance;
  });
  

  let errorMessage = $derived($page.url.searchParams.get('error'));
  let visible = $state(true);
  $effect(() => {
    if (errorMessage) {
        // Tunggu 3 detik, lalu hilangkan pesan dari URL tanpa refresh halaman
        const timer = setTimeout(() => {
            goto('/', { replaceState: true, noScroll: true, keepFocus: true });
            visible = false;
        }, 4000);
        
        return () => clearTimeout(timer);
    }
  });

  
  function in_toggleHybridPopup(mode) {
      hybridMode = mode;
      in_togglePopup();
  }

  function in_togglePopup() {
      in_showPopup = !in_showPopup;
      if (in_showPopup) {
          in_photoTaken = false;
          in_capturedFile = null;
          in_startCamera();
          in_getLocation();
      } else {
          in_stopCamera();
      }
  }

  async function in_startCamera() {
      try {
          if (in_stream) in_stopCamera();
          in_stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: in_cameraFacingMode }, 
            audio: false 
          });
          if (in_videoElement) {
              in_videoElement.srcObject = in_stream;
          }
      } catch (err) {
          console.error("Error accessing the camera:", err);
          alert("Gagal mengakses kamera. Pastikan izin diberikan.");
      }
  }

  function in_stopCamera() {
      if (in_stream) {
          in_stream.getTracks().forEach(track => track.stop());
          in_stream = null;
      }
  }

  function in_switchCamera() {
      in_cameraFacingMode = in_cameraFacingMode === 'user' ? 'environment' : 'user';
      in_startCamera();
  }

  // new google.maps.LatLng(-6.19110210798804, 106.65742604634274),
  function in_getLocation() {
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
              // Parameter 1: Success Callback (Fungsi)
              (position) => {
                  locationData = {
                      lat: position.coords.latitude,
                      long: position.coords.longitude
                  }; 

                  if (work_base === 'office' || (work_base === 'hybrid' && hybridMode === 'office')) {
                      const officeLat = parseFloat(data.officelat); 
                      const officeLong = parseFloat(data.officelong); 
                      
                      const distance = google.maps.geometry.spherical.computeDistanceBetween(
                          new google.maps.LatLng(locationData.lat, locationData.long),
                          new google.maps.LatLng(officeLat, officeLong)
                      ); 

                      if (distance > 20) {
                          isInOfficeArea = false; 
                          responseMessage = `ANDA DI LUAR AREA KANTOR (${Math.round(distance)}m). ABSEN DITOLAK.`; 
                      } else {
                          isInOfficeArea = true; 
                          responseMessage = null; 
                      }
                  }
              },
              // Parameter 2: Error Callback (Fungsi) - INI YANG TADI BERMASALAH
              (err) => {
                  console.error("Gagal mendapatkan lokasi:", err); 
                  responseMessage = "GAGAL MENDAPATKAN LOKASI. PASTIKAN GPS AKTIF.";
              },
              // Parameter 3: Options (Object)
              { 
                  enableHighAccuracy: true, 
                  timeout: 10000 
              } 
          );
      }
  }

  function in_handleTakePhoto() {
      if (!in_videoElement || !in_canvasElement) return;

      in_canvasElement.width = in_videoElement.videoWidth;
      in_canvasElement.height = in_videoElement.videoHeight;
      const context = in_canvasElement.getContext('2d');
      context.drawImage(in_videoElement, 0, 0, in_canvasElement.width, in_canvasElement.height);

      in_photoPreviewUrl = in_canvasElement.toDataURL('image/jpeg', 0.8);
      
      in_canvasElement.toBlob((blob) => {
          // Mengonversi Blob menjadi File agar bisa dikirim via FormData
          in_capturedFile = new File([blob], `attendance_${Date.now()}.jpg`, { type: 'image/jpeg' });
      }, 'image/jpeg', 0.8);

      in_photoTaken = true;
      in_stopCamera();
  }

  const stats = $derived([
    {
      label: `Sisa ${totalAtt?.totalSisaCuti?.[0]?.nama_cuti ?? '-'}`,
      value: totalAtt?.totalSisaCuti?.[0]?.sisa_cuti ?? '-',
      unit: 'Hari',
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Tahun 2024'
    },
    {
      label: 'Kehadiran Bulan Ini',
      value: totalAtt?.totalHadir?.[0]?.total_kehadiran ?? '-',
      unit: 'Hari',
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Status: Aktif'
    },
    {
      label: 'Rata-rata Jam Kerja',
      value: totalAtt?.totalJamKerja?.[0]?.avg_jam_kerja ?? '-',
      unit: 'Jam/Hari',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      desc: 'Produktivitas Baik'
    }
  ]);

  const today = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
</script>

<main class="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
  <div class="max-w-4xl mx-auto space-y-6">
    <section class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="p-3 bg-slate-50 rounded-2xl">
                    <Calendar size={18} class="text-slate-500"/>
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-800">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p class="text-[10px] text-slate-400 font-medium">Jam Kerja: 08:00 - 17:00</p>
                </div>
            </div>
            {#if hasCheckedIn}
                <div class="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span class="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span class="text-[10px] font-bold text-emerald-700 uppercase">Sudah Hadir</span>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Jam Masuk</p>
                <p class="text-lg font-bold text-slate-700">{data.todayAttendance?.data?.check_in_time || '--:--'}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Jam Keluar</p>
                <p class="text-lg font-bold text-slate-700">{data.todayAttendance?.data?.check_out_time || '--:--'}</p>
            </div>
        </div>

        {#if responseMessage}
          <div class="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-[10px] font-bold text-center" transition:slide>
            ⚠️ {responseMessage}
          </div>
        {/if}

        <div class="pt-2">
            {#if work_base === 'office' || work_base === 'technician'}
                <button 
                    onclick={in_togglePopup}
                    class="w-full py-5 {hasCheckedIn ? 'bg-rose-600 shadow-rose-100' : 'bg-indigo-600 shadow-indigo-100'} text-white rounded-[1.5rem] font-bold text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    {#if hasCheckedIn}<RefreshCcw size={18}/>{:else}<Camera size={18}/>{/if}
                    {hasCheckedIn ? 'ABSEN KELUAR (CHECK OUT)' : 'ABSEN MASUK (CHECK IN)'}
                </button>
            {:else if work_base === 'hybrid'}
                {#if !hasCheckedIn}
                    <div class="grid grid-cols-1 gap-3">
                        <button onclick={() => in_toggleHybridPopup('office')} class="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 flex items-center justify-between group transition-all">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600"><Briefcase size={20}/></div>
                                <span class="text-sm font-bold text-slate-700">Bekerja dari Kantor (WFO)</span>
                            </div>
                            <ChevronRight size={18} class="text-slate-300"/>
                        </button>
                        <button onclick={() => in_toggleHybridPopup('technician')} class="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 flex items-center justify-between group transition-all">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600"><MapPin size={20}/></div>
                                <span class="text-sm font-bold text-slate-700">Bekerja di Luar (WFA)</span>
                            </div>
                            <ChevronRight size={18} class="text-slate-300"/>
                        </button>
                    </div>
                {:else}
                    <button onclick={in_togglePopup} class="w-full py-5 bg-rose-600 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-rose-100 active:scale-[0.98] transition-all">
                        ABSEN KELUAR SEKARANG
                    </button>
                {/if}
            {/if}
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#if work_base !== 'office'}
          <!-- <main class="flex-1 overflow-y-auto pb-20">  -->
            <div class="p-2 md:p-6">
                <!-- Dashboard Cards Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <!-- Total Closed Tickets Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-emerald-500 transition-transform duration-300 hover:scale-105">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-semibold text-gray-600">Total Closed Tickets</h3>
                            <div class="text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        </div>
                        <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_totalClosed.total}</span>
                        <span class="text-gray-500">/ {data.data_totalClosed.last_month}</span>
                    </div>

                    <!-- Total Open Tickets Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-500 transition-transform duration-300 hover:scale-105">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-semibold text-gray-600">Total Open Tickets</h3>
                            <div class="text-orange-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                    <line x1="8" y1="16" x2="16" y2="16"></line>
                                </svg>
                            </div>
                        </div>
                        <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_totalOpen.total} </span>
                        <span class="text-gray-500">/ {data.data_totalOpen.last_month}</span>
                    </div>

                    <!-- Average Time to Done Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-sky-500 transition-transform duration-300 hover:scale-105">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-semibold text-gray-600">Avg. Time to Done</h3>
                            <div class="text-sky-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 21a9 9 0 007.41-14.79L12 2v5l-4-4"></path>
                                </svg>
                            </div>
                        </div>
                        <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_avgClosed.average_total??0} </span>
                        <span class="text-gray-500">/ {data.data_avgClosed.last_month}</span>
                    </div>

                    <!-- Total by Category Card -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-violet-500 transition-transform duration-300 hover:scale-105">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-semibold text-gray-600">Total by Category</h3>
                            <div class="text-violet-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h14l4 4zM16 21V5H4v16M11 5v16"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="mt-4 flex flex-col space-y-2 text-sm text-gray-800">
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-red-500">Urgent</span>
                                <span class="font-bold">{data.data_totalLow.total} / {data.data_totalLow.last_month}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-yellow-500">Medium</span>
                                <span class="font-bold">{data.data_totalMedium.total} / {data.data_totalMedium.last_month}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-blue-500">Low</span>
                                <span class="font-bold">{data.data_totalUrgent.total} / {data.data_totalUrgent.last_month}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        <!-- </main> -->
        {/if}
        <div class="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div class="max-w-6xl mx-auto">
                <!-- <header class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Ringkasan Kehadiran</h1>
                    <p class="text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar size={16} /> {today}
                    </p>
                </div>
                <div class="flex gap-3">
                    <button class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    Unduh Laporan
                    </button>
                    <button class="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                    Ajukan Cuti
                    </button>
                </div>
                </header> -->

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {#each stats as stat}
                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-24 h-24 {stat.bg} rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
                    
                    <div class="flex flex-col h-full relative z-10">
                        <div class="flex items-center gap-4 mb-4">
                        <div class="p-3 {stat.bg} {stat.color} rounded-2xl">
                            <stat.icon size={24} />
                        </div>
                        <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        
                        <div class="mt-auto">
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-bold text-slate-800">{stat.value}</span>
                            <span class="text-sm font-medium text-slate-500">{stat.unit}</span>
                        </div>
                        <div class="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <TrendingUp size={12} class="text-emerald-500" />
                            {stat.desc}
                        </div>
                        </div>
                    </div>
                    </div>
                {/each}
                </div>

                <!-- <section class="mt-10 bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div class="text-center md:text-left">
                            <h2 class="text-xl font-bold mb-2">Perlu Koreksi Absensi?</h2>
                            <p class="text-indigo-200 text-sm max-w-md">Jika terdapat ketidaksesuaian pada jam kerja Anda, silakan ajukan koreksi sebelum periode penggajian berakhir.</p>
                        </div>
                        <button class="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                            Buka Form Koreksi
                        </button>
                    </div>
                    <div class="absolute right-0 top-0 w-64 h-64 bg-indigo-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                </section> -->
            </div>
        </div>
      
    </div>

    <div class="h-15 bg-slate-100/50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center italic text-slate-400">
    </div>

  </div>
</main>

{#if in_showPopup}
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm" transition:fade>
    <div class="bg-white w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl p-2" in:fly={{ y: 100 }}>
      <div class="p-6 flex justify-between items-center">
        <h3 class="font-bold text-slate-800 text-lg">Verifikasi Wajah</h3>
        <button type="button" onclick={in_togglePopup} class="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
      </div>

      <div class="relative bg-slate-100 aspect-[4/5] overflow-hidden rounded-[2.5rem] mx-4 border-4 border-slate-50">
        {#if !in_photoTaken}
          <video bind:this={in_videoElement} class="w-full h-full object-cover {in_cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}" autoplay playsinline></video>
          <div class="absolute inset-0 border-[3rem] border-black/10 pointer-events-none flex items-center justify-center">
             <div class="w-full h-full border-2 border-dashed border-white/60 rounded-[2rem]"></div>
          </div>
        {:else}
          <img src={in_photoPreviewUrl} alt="Preview" class="w-full h-full object-cover" />
        {/if}
      </div>

      <canvas bind:this={in_canvasElement} class="hidden"></canvas>

      <div class="p-6 mb-2">
        {#if !in_photoTaken}
          <button type="button" onclick={in_handleTakePhoto} class="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95">
            <Camera size={20} /> AMBIL FOTO SEKARANG
          </button>
        {:else}
          <div class="flex gap-3">
            <button type="button" onclick={() => { in_photoTaken = false; in_startCamera(); }} class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
              ULANGI
            </button>
            <form 
              method="POST" 
              action={hasCheckedIn ? "?/absenKeluar" : "?/absenMasuk"}
              enctype="multipart/form-data"
              use:enhance={({ formData }) => {
                if (!in_capturedFile) return;
                formData.append('photo', in_capturedFile);
                formData.append('latitude', locationData.lat);
                formData.append('longitude', locationData.long);
                formData.append('attendance_mode', work_base === 'hybrid' ? hybridMode : work_base);
                isSubmitting = true;
                return async ({ result }) => {
                  if (result.type === 'success') {
                      // Update status check-in berdasarkan aksi
                      if (result.data.fromAction === 'checkin') {
                          hasCheckedIn = true;
                          // Simpan mode yang baru saja digunakan ke state agar UI konsisten
                          hybridMode = formData.get('attendance_mode'); 
                      } else {
                          hasCheckedIn = false;
                          hybridMode = null;
                      }
                    } else {
                        responseMessage = result.data.message;
                    }
                  in_togglePopup();
                  isSubmitting = false;
                };
              }}
              class="flex-[2]"
            >
              <button type="submit" disabled={isSubmitting || (work_base === 'office' && !isInOfficeArea)} class="w-full py-4 {hasCheckedIn ? 'bg-rose-600' : 'bg-emerald-600'} text-white rounded-2xl font-bold shadow-lg disabled:bg-slate-300">
                {isSubmitting ? 'MENGIRIM...' : 'KONFIRMASI'}
              </button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}