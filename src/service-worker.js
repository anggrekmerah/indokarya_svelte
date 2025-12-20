import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'; // PENTING: Import khusus untuk SW


import { build, files, version } from '$service-worker';
import { deleteOfflineTask, deserializeTask} from '$lib/stores/report'

// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />


const firebaseConfig = {
  apiKey: "AIzaSyBNM4KR8eS2Anq10jgl5rIAfkpxmEqGlc4",
  authDomain: "teknisi-indokarya.firebaseapp.com",
  projectId: "teknisi-indokarya",
  storageBucket: "teknisi-indokarya.firebasestorage.app",
  messagingSenderId: "756950734066",
  appId: "1:756950734066:web:35b4ce6a6684a5b451ec6b"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// This gives `self` the correct types
const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    '/',
    '/home',
	...build, // the app itself
	...files  // everything in `static`
];

// --- Handle Pesan Push Background ---
onBackgroundMessage(messaging, (payload) => {
    console.log('[SW] Pesan Background Diterima', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/path/to/icon.png',
        data: payload.data 
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- Handle Klik Notifikasi (Opsional) ---
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Ambil data URL dari payload
    const url = event.notification.data.action_link || '/admin';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});


self.addEventListener('sync', (event) => {
    // 1. Periksa apakah event.tag sesuai dengan ID formulir yang kita simpan
    console.log('event.tag.startsWith(\'sync-\')')
    console.log(event.tag.startsWith('sync-'))
	if (event.tag.startsWith('sync-')) {
        console.log(`[SW] Background Sync terdeteksi untuk ID: ${event.tag}`);
        
        // 2. Cegah SW tidur sampai tugas selesai
        event.waitUntil(
            // Fungsi Asinkron untuk Mengambil data formulir dari IndexedDB
            deserializeTask(event.tag)
                .then(result => {

					if (!result) {
                        console.log(`[SW] Tugas dengan ID ${event.tag} tidak ditemukan.`);
                        return;
                    }
                    const { task, formData } = result;

                    // Lakukan pengiriman POST ke server SvelteKit (URL yang tersimpan di Dexie)
                    return fetch(task.url, {
                        method: 'POST',
                        body: formData 
                    });

                })
                .then(response => {
                    if (response.ok) {
                        console.log(`[SW] Formulir ${event.tag} berhasil dikirim!`);
                        // 4. Hapus data dari IndexedDB setelah sukses
                        return deleteOfflineTask(event.tag);
                    } else {
                        // Jika server merespon error, biarkan data tetap di IDB untuk percobaan selanjutnya
                        console.error(`[SW] Pengiriman Gagal (Server Error ${response.status}). Akan dicoba lagi.`);
                        throw new Error('Server returned an error');
                    }
                })
                .catch(error => {
                    // Jika gagal karena masalah jaringan/klien, SW akan otomatis mencoba lagi nanti.
                    console.error('[SW] Pengiriman Gagal Total. Dicoba lagi nanti:', error);
                    // Lemparkan error agar SyncManager tahu untuk mencoba lagi
                    throw error; 
                })
        );
    }
});

self.addEventListener('fetch', (event) => {
    
    // Abaikan permintaan yang bukan GET
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);
        
        // Cek apakah itu permintaan Navigasi (memuat halaman HTML)
        const isNavigationRequest = event.request.mode === 'navigate';

        // 1. Prioritas tertinggi: Aset yang di-precache (`build` dan `files`)
        // Ini memastikan aset JS/CSS aplikasi selalu tersedia.
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response) return response;
        }

        // 2. Penanganan Halaman Navigasi (termasuk /home)
        if (isNavigationRequest) {
            
            // ⭐ PENTING: Buat URL baru TANPA parameter kueri
            // Ini mengubah '/home?id_status=1' menjadi '/home'
            const cleanUrl = url.origin + url.pathname;
            
            // Coba temukan di cache dengan URL yang sudah dibersihkan
            const cachedResponse = await cache.match(cleanUrl);

            if (cachedResponse) {
                console.log(`[SW] Melayani halaman dari cache: ${cleanUrl}`);
                return cachedResponse;
            }
        }
        
        // 3. Fallback: Coba dari Jaringan (dan cache jika respons OK)
        try {
            const response = await fetch(event.request);

            if (!(response instanceof Response)) {
                 throw new Error('invalid response from fetch');
            }

            // Jika status 200, Anda bisa memilih untuk menyimpan respons ini (Dynamic Cache)
            // Namun, untuk halaman navigasi, biasanya ini dihindari untuk menghemat ruang.
            // Biarkan baris cache.put di-comment jika Anda hanya ingin precache.
            // if (response.status === 200) { cache.put(event.request, response.clone()); }

            return response;
        } catch (err) {
            // 4. Offline Fallback Terakhir: Coba temukan request asli (dengan query) di cache.
            const response = await cache.match(event.request);

            if (response) return response;

            // Jika tidak ada cache, lempar error browser (Page Not Reached)
            throw err;
        }
    }

    event.respondWith(respond());
});