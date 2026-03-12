import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

import {
    PUBLIC_APIKEY,
    PUBLIC_AUTHDOMAIN,
    PUBLIC_PROJECTID,
    PUBLIC_STORAGEBUCKET,
    PUBLIC_MESSAGINGSENDERID,
    PUBLIC_APPID
} from '$env/static/public';

import { build, files, version } from '$service-worker';
import { deleteOfflineTask, deserializeTask } from '$lib/stores/report';
import { attendanceStore } from '$lib/stores/attendanceStore';

// --- Type Definitions ---
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

// --- Firebase Setup ---
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

// --- Cache Configuration ---
const CACHE = `cache-${version}`;
const ASSETS = [
    '/',
    '/home',
    '/login',
    '/task',
    '/history',
    ...build,
    ...files.filter(file => !file.includes('.gitkeep') && !file.includes('.DS_Store'))
];

// --- Lifecycle Events ---
self.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        for (const url of ASSETS) {
            try {
                await cache.add(url);
            } catch (e) {
                console.warn(`[SW] Gagal meng-cache: ${url}`, e);
                for (const url of ASSETS) {
                    try { await cache.add(url); } catch (err) { console.error(`Gagal: ${url}`); }
                }
            }
        }
    }
    event.waitUntil(addFilesToCache());
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        const keys = await caches.keys();
        for (const key of keys) {
            if (key !== CACHE) await caches.delete(key);
        }
    }
    event.waitUntil(deleteOldCaches());
    self.clients.claim(); 
});

// --- Push Notifications ---
onBackgroundMessage(messaging, (payload) => {
    console.log('[SW] Pesan Background Diterima', payload);
    const data = payload.data;
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        data: { action_link: data.action_link }
    });
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data.action_link || '/home';
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then(windowClients => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});

// --- Helper Functions ---
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
    const records = await attendanceStore.getUnsynced();

    if (records.length === 0) return;

    for (const record of records) {
        try {
            const formData = new FormData();
            const [lat, long] = record.check_in_location.split(',');

            formData.append('latitude', lat.trim());
            formData.append('longitude', long.trim());
            formData.append('attendance_mode', record.attendance_mode);
            formData.append('is_offline_sync', 'true');
            
            if (record.check_in_photo && record.check_in_photo.startsWith('data:image')) {
                const photoBlob = base64ToBlob(record.check_in_photo);
                formData.append('photo', photoBlob, `offline_photo_${record.id}.jpg`);
            }

            const response = await fetch('/home?/absenMasuk', {
                method: 'POST',
                body: formData,
                headers: { 'x-sveltekit-action': 'true' }
            });

            if (response.ok) {
                await attendanceStore.deleteSynced(record.id);
                self.registration.showNotification("Absen Terkirim", {
                    body: "Data absen offline Anda berhasil disinkronkan.",
                    icon: "/favicon.png"
                });
                const clients = await self.clients.matchAll();
                clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
            }
        } catch (error) {
            console.error(`[SW] Gagal sinkronisasi ID ${record.id}:`, error);
        }
    }
}

async function handleDynamicSync(tableName, ticketId) {
    try {
        const result = await deserializeTask(tableName, ticketId);
        if (!result) return;

        const { task, formData } = result;
        const isJson = tableName === 'timelines';
        let fetchOptions = { method: 'POST', headers: {} };

        if (isJson) {
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
        
        const response = await fetch(task.url, { ...fetchOptions });

        if (response.ok) {
            await deleteOfflineTask(tableName, ticketId);
            self.registration.showNotification("Update Berjaya", {
                body: `Data ${tableName} untuk tiket #${ticketId} telah dihantar.`,
                icon: "/favicon.png"
            });
            const clients = await self.clients.matchAll();
            clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
        }
    } catch (error) {
        console.error(`[SW] Gagal sinkronisasi ${tableName}:`, error);
        throw error; 
    }
}

// --- Fetch Handler (Core Logic) ---
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith('/@fs/') || url.pathname.startsWith('/@vite/') || url.pathname.includes('hot-update')) return;
    if (event.request.method !== 'GET' || url.origin !== location.origin) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE);

        // Strategi Navigasi (Mencegah ERR_FAILED)
        if (event.request.mode === 'navigate') {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 detik limit

                const networkResponse = await fetch(event.request, {
                    signal: controller.signal,
                    mode: 'navigate',
                    redirect: 'follow'
                });
                clearTimeout(timeoutId);

                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                }
            } catch (err) {
                console.warn('[SW] Navigasi gagal/timeout, beralih ke cache.');
            }

            const cached = await cache.match(event.request);
            return cached || await cache.match('/') || new Response("Offline", { status: 503 });
        }

        // Strategi Aset Statis (Cache-First)
        if (build.includes(url.pathname) || files.includes(url.pathname)) {
            const matched = await cache.match(event.request);
            if (matched) return matched;
        }

        // Strategi Standar (Network-First Fallback Cache)
        try {
            const response = await fetch(event.request);
            return response;
        } catch (err) {
            const cached = await cache.match(event.request);
            return cached || new Response(null, { status: 404 });
        }
    })());
});

// --- Other Event Listeners ---
self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'PREFETCH_TASKS' || event.data.type === 'PREFETCH_HISTORY')) {
        event.waitUntil(
            caches.open(CACHE).then((cache) => {
                return Promise.allSettled(
                    event.data.urls.map(url => fetch(url).then(res => res.ok ? cache.put(url, res) : null))
                );
            })
        );
    }
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