import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'; // PENTING: Import khusus untuk SW

import {PUBLIC_APIKEY,
            PUBLIC_AUTHDOMAIN,
            PUBLIC_PROJECTID,
            PUBLIC_STORAGEBUCKET,
            PUBLIC_MESSAGINGSENDERID,
            PUBLIC_APPID} from '$env/static/public';
import { build, files, version } from '$service-worker';
import { deleteOfflineTask, deserializeTask} from '$lib/stores/report'
import { attendanceStore } from '$lib/stores/attendanceStore'; // Pastikan path benar

// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />




    // Konfigurasi Firebase Anda (Disalin dari firebase-messaging-sw.js)
    const firebaseConfig = {
    apiKey: PUBLIC_APIKEY,
    authDomain: PUBLIC_AUTHDOMAIN,
    projectId: PUBLIC_PROJECTID,
    storageBucket: PUBLIC_STORAGEBUCKET,
    messagingSenderId: PUBLIC_MESSAGINGSENDERID,
    appId: PUBLIC_APPID
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
    '/task',
    '/history',
	...build, // the app itself
	...files.filter(file => !file.includes('.gitkeep') && !file.includes('.DS_Store'))
];

// --- Handle Pesan Push Background ---
onBackgroundMessage(messaging, (payload) => {
    console.log('[SW] Pesan Background Diterima', payload);

    const data = payload.data; // Data sekarang ada di root payload.data
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        data: { action_link: data.action_link } // Kirim link ke event notificationclick
    });

    // const notificationTitle = payload.notification.title;
    // const notificationOptions = {
    //     body: payload.notification.body,
    //     icon: '/path/to/icon.png',
    //     data: payload.data 
    // };

    // self.registration.showNotification(notificationTitle, notificationOptions);
});

function base64ToBlob(base64, type = 'image/jpeg') {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
}

async function syncAttendanceRecords() {
    console.log('[SW] Memulai sinkronisasi absen...');
    
    // PENTING: Gunakan akses langsung ke DB jika import store bermasalah di SW
    // Jika attendanceStore gagal di-load, gunakan db (Dexie) langsung
    const records = await attendanceStore.getUnsynced();

    if (records.length === 0) {
        console.log('[SW] Tidak ada data absen pending.');
        return;
    }

    for (const record of records) {
        try {
            const formData = new FormData();
            const [lat, long] = record.check_in_location.split(',');

            formData.append('latitude', lat.trim());
            formData.append('longitude', long.trim());
            formData.append('attendance_mode', record.attendance_mode);
            formData.append('is_offline_sync', 'true');
            
            // Handle Foto jika ada
            if (record.check_in_photo && record.check_in_photo.startsWith('data:image')) {
                const photoBlob = base64ToBlob(record.check_in_photo);
                formData.append('photo', photoBlob, `offline_photo_${record.id}.jpg`);
            }

            // Gunakan URL absolut atau relatif yang benar terhadap origin
            const response = await fetch('/home?/absenMasuk', {
                method: 'POST',
                body: formData,
                headers: {
                    'x-sveltekit-action': 'true'
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Gunakan markAsSynced atau langsung delete sesuai kebutuhan Anda
                await attendanceStore.deleteSynced(record.id);
                console.log(`[SW] Sinkronisasi sukses untuk ID: ${record.id}`);
                
                // Opsional: Tampilkan notifikasi ke user
                self.registration.showNotification("Absen Terkirim", {
                    body: "Data absen offline Anda berhasil disinkronkan.",
                    icon: "/favicon.png"
                });

                const clients = await self.clients.matchAll();
                clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
                
            } else {
                console.error(`[SW] Server menolak data:`, result);
            }
        } catch (error) {
            console.error(`[SW] Gagal sinkronisasi ID ${record.id}:`, error);
            // Jangan pakai 'throw error' di dalam loop agar record lain tetap dicoba
        }
    }
}

async function handleDynamicSync(tableName, ticketId) {
    console.log(`[SW] Memulakan sinkronisasi ${tableName} untuk tiket: ${ticketId}`);
    
    try {
        // Ambil data dari Dexie menggunakan fungsi deserializeTask dari report.js
        const result = await deserializeTask(tableName, ticketId);
        
        if (!result) {
            console.warn(`[SW] Data ${tableName} tidak dijumpai, mungkin sudah disinkronkan.`);
            return;
        }

        const { task, formData } = result;
        const isJson = tableName === 'timelines';
        let fetchOptions = {
            method: 'POST', // Explicitly set to POST
            headers: {}
        };
        if (isJson) {
            // Konversi kembali FormData ke JSON jika tabelnya adalah timelines
            const jsonBody = {};
            formData.forEach((value, key) => { jsonBody[key] = value; });
            fetchOptions.body = JSON.stringify(jsonBody);
            fetchOptions.headers['Content-Type'] = 'application/json';
        } else {
            fetchOptions.body = formData;
        }

        if (task.headers) {
            fetchOptions.headers = { ...fetchOptions.headers, ...task.headers };
        }
        
        // Kirim ke server
        const response = await fetch(task.url, { ...fetchOptions });

        if (response.ok) {
            console.log(`[SW] ${tableName} berjaya disinkronkan!`);
            // Padam data dari lokal setelah berjaya
            await deleteOfflineTask(tableName, ticketId);
            
            // Papar notifikasi kepada user
            self.registration.showNotification("Update Berjaya", {
                body: `Data ${tableName} untuk tiket #${ticketId} telah dihantar.`,
                icon: "/favicon.png"
            });

            const clients = await self.clients.matchAll();
            clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));

        } else {
            const errText = await response.text();
            throw new Error(`Server Response Error: ${response.status}`);
        }
    } catch (error) {
        console.error(`[SW] Gagal sinkronisasi ${tableName}:`, error);
        throw error; // Supaya browser cuba lagi (retry)
    }
}

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

self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'PREFETCH_TASKS' || event.data.type === 'PREFETCH_HISTORY')) {
        
        const urlsToCache = event.data.urls;
        
        event.waitUntil(
            caches.open(CACHE).then((cache) => {
                // Gunakan Promise.allSettled agar jika 1 URL gagal, yang lain tetap jalan
                return Promise.allSettled(
                    urlsToCache.map(url => {
                        return fetch(url) // , { mode: 'navigate' }
                            .then(response => {
                                if (response.ok) return cache.put(url, response);
                            })
                            .catch(err => console.error(`Gagal prefetch ${url}:`, err));
                    })
                );
            })
        );
    }
});

self.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        // Jangan gunakan addAll jika ada kemungkinan path gagal
        for (const url of ASSETS) {
            try {
                await cache.add(url);
            } catch (e) {
                console.warn(`[SW] Gagal meng-cache: ${url}`, e);
            }
        }
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

    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncAttendanceRecords());
    }

    const dynamicSync = event.tag.match(/^sync-(report|checkin|unlock|timelines)-(.+)$/);
    
    if (dynamicSync) {
        const [, tableName, ticketId] = dynamicSync;
        event.waitUntil(handleDynamicSync(tableName, ticketId));
    }

});


// service-worker.js

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Filter awal: Abaikan internal Vite & Request selain GET
    if (url.pathname.startsWith('/@fs/') || url.pathname.startsWith('/@vite/') || url.pathname.includes('hot-update')) return;
    if (event.request.method !== 'GET' || url.origin !== location.origin) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const isNavigationRequest = event.request.mode === 'navigate';

        // 2. Strategi Aset Statis (Build & Files) - Cache First
        if (build.includes(url.pathname) || files.includes(url.pathname)) {
            const matched = await cache.match(event.request);
            if (matched) return matched;
        }

        // 3. Strategi Navigasi (Termasuk Halaman Dinamis /ticket/*)
        if (isNavigationRequest) {
            try {
                // Selalu coba ambil yang terbaru dari Network
                const networkResponse = await fetch(event.request, {
                    mode: 'navigate',
                    redirect: 'follow'
                });

                if (networkResponse.ok) {
                    const responseForCache = networkResponse.clone();
                    // Simpan ke cache tanpa await agar tidak menghambat response ke user
                    cache.put(event.request, responseForCache);
                    return networkResponse;
                }
            } catch (err) {
                console.error('[SW] Navigation fetch failed, checking cache:', err);
            }

            // Jika offline atau network error, ambil dari cache
            const cached = await cache.match(event.request);
            // Jika tidak ada di cache sama sekali, fallback ke halaman utama '/'
            return cached || await cache.match('/') || new Response("Offline", { status: 503 });
        }

        // 4. Strategi Standar (Images, API GET, dll)
        try {
            const response = await fetch(event.request);
            return response;
        } catch (err) {
            const cached = await cache.match(event.request);
            if (cached) return cached;
            
            // Return Response kosong agar browser tidak error 'Failed to convert'
            return new Response(null, { status: 404 });
        }
    })());
});
