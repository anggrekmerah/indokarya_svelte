import { writable } from 'svelte/store';
import { db } from '$lib/stores/dexiedb.js';
import { isOnline } from '$lib/stores/ticketStore.js'; // Mengambil store online yang sudah ada

export const pendingSyncCount = writable(0);

// Fungsi untuk menghitung data yang belum sinkron
export async function updatePendingCount() {
    try {
        // Hitung total dari tabel attendance dan report/task yang tertunda
        const attendanceCount = await db.attendance.where('sync_status').equals('pending').count();
        const reportCount = await db.report.count(); // Sesuaikan dengan nama tabel offline Anda
        
        pendingSyncCount.set(attendanceCount + reportCount);
    } catch (error) {
        console.error("Gagal menghitung data pending:", error);
    }
}