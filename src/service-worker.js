/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

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


// ============================
// FIREBASE
// ============================

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


// ============================
// CACHE CONFIG
// ============================

const CACHE = `cache-${version}`;

const ASSETS = [
    '/',
    '/home',
    '/login',
    '/task',
    '/history',
    '/forgot-password',
    ...build,
    ...files.filter(file => !file.includes('.gitkeep') && !file.includes('.DS_Store'))
];


// ============================
// INSTALL
// ============================

self.addEventListener('install', (event) => {

    event.waitUntil((async () => {

        const cache = await caches.open(CACHE);

        for (const url of ASSETS) {

            try {

                await cache.add(url);

            } catch (err) {

                console.warn('[SW] gagal cache:', url);

            }

        }

    })());

    self.skipWaiting();

});


// ============================
// ACTIVATE
// ============================

self.addEventListener('activate', (event) => {

    event.waitUntil((async () => {

        const keys = await caches.keys();

        await Promise.all(

            keys.map(key => {

                if (key !== CACHE) {

                    return caches.delete(key);

                }

            })

        );

    })());

    self.clients.claim();

});


// ============================
// PUSH NOTIFICATION
// ============================

onBackgroundMessage(messaging, (payload) => {

    const data = payload.data;

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        data: { action_link: data.action_link }
    });

});

self.addEventListener('notificationclick', (event) => {

    event.notification.close();

    const url = event.notification.data?.action_link || '/home';

    event.waitUntil(

        self.clients.matchAll({ type: 'window' }).then((clients) => {

            for (const client of clients) {

                if (client.url === url && 'focus' in client) {

                    return client.focus();

                }

            }

            if (self.clients.openWindow) {

                return self.clients.openWindow(url);

            }

        })

    );

});


// ============================
// FETCH
// ============================

self.addEventListener('fetch', (event) => {

    const request = event.request;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/@fs/') ||
        url.pathname.startsWith('/@vite/') ||
        url.pathname.includes('hot-update')) return;

    if (url.origin !== location.origin) return;

    const accept = request.headers.get('accept') || '';



    // ============================
    // HTML REQUEST (LOGIN SAFE)
    // ============================

    if (accept.includes('text/html')) {

        event.respondWith((async () => {

            try {

                const controller = new AbortController();

                const timeout = setTimeout(() => controller.abort(), 6000);

                const network = await fetch(request, {
                    signal: controller.signal,
                    credentials: 'include'
                });

                clearTimeout(timeout);

                return network;

            } catch {

                const cache = await caches.open(CACHE);

                const cached = await cache.match(request);

                return cached ||
                       await cache.match('/') ||
                       new Response("Offline", { status: 503 });

            }

        })());

        return;

    }



    // ============================
    // STATIC ASSET CACHE
    // ============================

    if (build.includes(url.pathname) || files.includes(url.pathname)) {

        event.respondWith((async () => {

            const cache = await caches.open(CACHE);

            const cached = await cache.match(request);

            if (cached) return cached;

            const response = await fetch(request);

            if (response.ok) {

                await cache.put(request, response.clone());

            }

            return response;

        })());

        return;

    }

});


// ============================
// HELPER
// ============================

function base64ToBlob(base64, type = 'image/jpeg') {

    const byteString = atob(base64.split(',')[1]);

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {

        ia[i] = byteString.charCodeAt(i);

    }

    return new Blob([ab], { type });

}



// ============================
// SYNC ATTENDANCE
// ============================

async function syncAttendanceRecords() {

    const records = await attendanceStore.getUnsynced();

    if (!records.length) return;

    for (const record of records) {

        try {

            const formData = new FormData();

            const [lat, long] = record.check_in_location.split(',');

            formData.append('latitude', lat.trim());
            formData.append('longitude', long.trim());
            formData.append('attendance_mode', record.attendance_mode);
            formData.append('is_offline_sync', 'true');

            if (record.check_in_photo?.startsWith('data:image')) {

                const blob = base64ToBlob(record.check_in_photo);

                formData.append('photo', blob, `offline_photo_${record.id}.jpg`);

            }

            const response = await fetch('/home?/absenMasuk', {
                method: 'POST',
                body: formData,
                headers: { 'x-sveltekit-action': 'true' }
            });

            if (response.ok) {

                await attendanceStore.deleteSynced(record.id);

                self.registration.showNotification("Absen Terkirim", {
                    body: "Data absen offline berhasil disinkronkan.",
                    icon: "/favicon.png"
                });

            }

        } catch (error) {

            console.error('[SW] gagal sync attendance', error);

        }

    }

}



// ============================
// TASK SYNC
// ============================

async function handleDynamicSync(tableName, ticketId) {

    const result = await deserializeTask(tableName, ticketId);

    if (!result) return;

    const { task, formData } = result;

    let fetchOptions = { method: 'POST', headers: {} };

    if (tableName === 'timelines') {

        const json = {};

        formData.forEach((v, k) => json[k] = v);

        fetchOptions.body = JSON.stringify(json);

        fetchOptions.headers['Content-Type'] = 'application/json';

    } else {

        fetchOptions.body = formData;

    }

    if (task.headers) {

        fetchOptions.headers = { ...fetchOptions.headers, ...task.headers };

    }

    const response = await fetch(task.url, fetchOptions);

    if (response.ok) {

        await deleteOfflineTask(tableName, ticketId);

    }

}



// ============================
// BACKGROUND SYNC
// ============================

self.addEventListener('sync', (event) => {

    if (event.tag === 'sync-attendance') {

        event.waitUntil(syncAttendanceRecords());

    }

    const dynamic = event.tag.match(/^sync-(report|checkin|unlock|timelines)-(.+)$/);

    if (dynamic) {

        const [, tableName, ticketId] = dynamic;

        event.waitUntil(handleDynamicSync(tableName, ticketId));

    }

});


// ============================
// PREFETCH
// ============================

self.addEventListener('message', (event) => {

    if (!event.data) return;

    const type = event.data.type;

    if (type === 'PREFETCH_TASKS' || type === 'PREFETCH_HISTORY') {

        event.waitUntil(

            caches.open(CACHE).then(async (cache) => {

                const urls = event.data.urls || [];

                await Promise.allSettled(

                    urls.map(async (url) => {

                        try {

                            const res = await fetch(url, {
                                credentials: 'include'
                            });

                            if (res.ok) {

                                await cache.put(url, res.clone());

                            }

                        } catch (err) {

                            console.warn('[SW] prefetch gagal:', url);

                        }

                    })

                );

            })

        );

    }

});