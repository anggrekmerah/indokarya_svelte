// src/lib/stores/ticketStore.js
import { writable } from 'svelte/store';
import { db } from '$lib/stores/dexiedb.js'; 
// ... impor lainnya (jika diperlukan)

// --- STATE MANAGEMENT ---
export const items = writable([]);
export const currentOffset = writable(0);
export const hasMore = writable(false);
export const isLoading = writable(false);
export const isOnline = writable(navigator.onLine);

// Konstanta
const LIMIT = 5;

// --- UTILITY ---

function getFilterParams(urlSearchParams) {
    const searchParams = urlSearchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    
    return {
        id_status: status,
        id_priority : priority,
        from : dateFrom,
        to : dateTo
    };
}

async function storeTickets(keyMetadata, response) {
    if (response && response.items) {
        await db.tickets.bulkPut(response.items.map(ticket => ({ ...ticket })));
        await db.metadata.put({ key: keyMetadata, offset: response.offset, hasMore: response.hasMore });
    }
}

// --- CORE LOGIC ---

/**
 * Fungsi inisialisasi utama untuk memuat data awal (dipanggil saat URL berubah).
 * @param {URLSearchParams} urlSearchParams - Query parameters dari SvelteKit $page.url
 * @param {object} initialData - Data listTicket dari SvelteKit load function
 */
export async function loadInitialData(keyMetadata, urlSearchParams, initialData) {
    console.log('initialData store')
    console.log(initialData)
    isLoading.set(true);
    const filters = getFilterParams(urlSearchParams);
    let onlineStatus = false;
    isOnline.subscribe(value => onlineStatus = value)();
    
    let dataTicket;

    let baseQuery = db.tickets;

    // Terapkan semua logika pemfilteran Dexie.js
    if (filters.id_status) {
        baseQuery = baseQuery.where('id_ticket_status').equals(filters.id_status);
    }
    if (filters.id_priority) {
        baseQuery = baseQuery.where('id_priority').equals(filters.id_priority);
    }
    if (filters.from && filters.to) {
        baseQuery = baseQuery.where('created_datetime').between(filters.from, filters.to, true, true);
    }

    try {
        console.log('onlineStatus', onlineStatus)
        if (onlineStatus && initialData) {
            // ONLINE: Simpan ke DB lokal & gunakan data dari server
            await storeTickets(keyMetadata, initialData);
            dataTicket = initialData;
        } else {
            // OFFLINE: Ambil dari DB lokal
            const metadata = await db.metadata.get(keyMetadata);
            const initialItems = await baseQuery.offset(0).limit(LIMIT).toArray();
            console.log('initialItems')
            console.log(initialItems)
            const calculatedHasMore = initialItems.length === LIMIT;

            dataTicket = {
                items: initialItems,
                offset: metadata?.offset ?? 0,
                hasMore: metadata?.hasMore ?? false,
            };
        }
    } catch (error) {
        // Fallback jika ada error (misal: DB belum diinisialisasi)
        const metadata = await db.metadata.get(keyMetadata);
        const initialItems = await baseQuery.offset(0).limit(LIMIT).toArray();
        dataTicket = {
            items: initialItems,
            offset: metadata?.offset ?? 0,
            hasMore: metadata?.hasMore ?? false,
        };
    } finally {
        console.log(dataTicket)
        items.set(dataTicket.items ?? []);
        currentOffset.set(dataTicket.items?.length ?? 0); // Offset dihitung dari jumlah item yang dimuat
        hasMore.set(dataTicket.hasMore ?? false);
        isLoading.set(false);
    }
}


/**
 * Fungsi untuk memuat data selanjutnya (Infinite Scroll).
 * @param {URLSearchParams} urlSearchParams - Query parameters dari SvelteKit $page.url
 */
export async function loadMoreItems(keyMetadata, apiEndpoint, urlSearchParams) {
    let $items, $currentOffset, $hasMore, $isOnline, $isLoading;
    items.subscribe(v => $items = v)();
    currentOffset.subscribe(v => $currentOffset = v)();
    hasMore.subscribe(v => $hasMore = v)();
    isOnline.subscribe(v => $isOnline = v)();
    // 🚨 FIX: Subscribe to isLoading to prevent race conditions check
    isLoading.subscribe(v => $isLoading = v)(); 

    
    if ($isLoading || !$hasMore) return;

    console.log('$isLoading', $isLoading)
    console.log('$hasMore', $hasMore)

    isLoading.set(true);
    const filters = getFilterParams(urlSearchParams);
    
    let baseQuery = db.tickets;
    let payload = { offset: $currentOffset };

    // ⭐ FIX: Terapkan SEMUA logika pemfilteran di sini juga
    if (filters.id_status) {
        payload.id_status = filters.id_status
        baseQuery = baseQuery.where('id_ticket_status').equals(filters.id_status);
    }
    if (filters.id_priority) {
        payload.id_priority = filters.id_priority
        baseQuery = baseQuery.where('id_priority').equals(filters.id_priority);
    }
    if (filters.from && filters.to) {
        payload.from = filters.from
        payload.to = filters.to
        baseQuery = baseQuery.where('created_datetime').between(filters.from, filters.to, true, true);
    }

    try {
        let newData = {};
        
        console.log('$isOnline',$isOnline)
        if ($isOnline) {
            // ONLINE
            
            console.log(payload)
            console.log('apiEndpoint', apiEndpoint)
            const responseAPI = await fetch(apiEndpoint, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });
            newData = await responseAPI.json();
            await storeTickets(keyMetadata, newData.data);

        } else {
            // OFFLINE
            const offlineItems = await baseQuery
                .offset($currentOffset)
                .limit(LIMIT)
                .toArray();
            
            newData.data = {
                items: offlineItems,
                // hasMore: true jika kita berhasil memuat item sebanyak LIMIT
                hasMore: offlineItems.length === LIMIT 
            };
        }
        console.log('newData')
        console.log(newData)
        if (newData?.data?.items) {
            const newItems = newData.data.items;
            items.set([...$items, ...newItems]);
            currentOffset.set($currentOffset + newItems.length);

            // Update hasMore berdasarkan item yang dimuat
            if (newItems.length < LIMIT) {
                hasMore.set(false);
            } else {
                // Gunakan nilai hasMore dari API jika Online, atau hasil perhitungan jika Offline
                hasMore.set(newData.data.hasMore);
            }
        }

    } catch (error) {
        console.error("Load More failed:", error);
        // Jika gagal, hentikan upaya load more
        hasMore.set(false);
    } finally {
        isLoading.set(false);
    }
}