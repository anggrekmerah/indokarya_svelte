<script>
    import { onMount } from 'svelte';
    import { initializeApp } from "firebase/app";
    // Ambil fungsi spesifik untuk messaging (karena kita menggunakan module modern)
    import { getMessaging, getToken, onMessage } from "firebase/messaging";
    
    // Konfigurasi Firebase Anda (Disalin dari firebase-messaging-sw.js)
    const firebaseConfig = {
        apiKey: "AIzaSyBNM4KR8eS2Anq10jgl5rIAfkpxmEqGlc4",
        authDomain: "teknisi-indokarya.firebaseapp.com",
        projectId: "teknisi-indokarya",
        storageBucket: "teknisi-indokarya.firebasestorage.app",
        messagingSenderId: "756950734066",
        appId: "1:756950734066:web:35b4ce6a6684a5b451ec6b"
    };


    // Fungsi untuk mengirim token ke backend Express.js Anda
    async function sendTokenToServer(token) {
        console.log("Mengirim token ke Express.js:", token);
        
        // Ganti URL ini dengan endpoint API Express.js Anda
        const API_ENDPOINT = '/api/notif/fcm'; 
        
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Jika Anda menggunakan token otorisasi di Svelte, tambahkan di sini
                    // 'Authorization': 'Bearer ' + userToken
                },
                body: JSON.stringify({ token: token })
            });
            
            if (response.ok) {
                console.log('Token FCM berhasil disimpan di server Express.js/Laravel.');
            } else {
                console.error('Gagal menyimpan token di server:', response.statusText);
            }
        } catch (error) {
            console.error('Error saat fetch token:', error);
        }
    }

    // Fungsi untuk inisialisasi FCM
    function initFCM() {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            console.warn("FCM tidak dapat diinisialisasi: Bukan di browser atau Service Worker tidak didukung.");
            return;
        }

        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // --- 1. Pendaftaran Service Worker & Kaitkan dengan FCM ---
        // Pendaftaran eksplisit sangat penting untuk menghindari error "no active Service Worker"
        navigator.serviceWorker.register('/service-worker.js', { scope: '/', type: 'module' })
            .then(async (registration) => {
                console.log('SW Svelte berhasil didaftarkan/ditemukan.');
                
                // Beri tahu Firebase registrasi SW mana yang valid
                // messaging.useServiceWorker(registration); 

                // --- 2. Dapatkan Token ---
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const currentToken = await getToken(messaging, { 
                        // Tambahkan 'serviceWorkerRegistration' jika ada masalah scope
                        serviceWorkerRegistration: registration 
                    });

                    if (currentToken) {
                        await sendTokenToServer(currentToken);
                    } else {
                        console.log('Tidak ada token perangkat yang tersedia. Minta izin notifikasi.');
                    }
                } else {
                    console.warn("Izin notifikasi ditolak.");
                }

                // --- 3. Handle Token Refresh ---
                // FCM secara otomatis menangani refresh token. Anda bisa memanggil getToken() secara berkala 
                // atau di event lain untuk memastikan token terbaru.
                // Dalam implementasi modern (v9), onTokenRefresh sudah jarang digunakan, 
                // cukup panggil getToken() dan pastikan Anda menghandle token yang "stale".
                
            }).catch(error => {
                console.error('Gagal mendaftarkan Service Worker Svelte:', error);
            });


        // --- 4. Handle Pesan Foreground (Saat Aplikasi Svelte Aktif) ---
        onMessage(messaging, (payload) => {
            console.log("Pesan Foreground FCM diterima (Svelte):", payload);
            
            // Logika untuk menampilkan notifikasi di UI Svelte
            // Gunakan Svelte store atau event dispatching untuk memperbarui UI
            alert(`Notifikasi Baru: ${payload.notification.title} - ${payload.notification.body}`);
            
            // ATAU: Tampilkan notifikasi native (jika diinginkan)
            // const notificationTitle = payload.notification.title;
            // new Notification(notificationTitle, { body: payload.notification.body });
        });
    }

    onMount(() => {
        initFCM();
    });
</script>