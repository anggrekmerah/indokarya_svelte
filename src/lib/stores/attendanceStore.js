import { db } from './dexiedb';

export const attendanceStore = {
    /**
     * Menyimpan data absen ke IndexedDB dengan pengecekan duplikasi
     * @param {Object} attendanceData - Data dari form/sensor
     */
    async saveAttendanceOffline(attendanceData) {
        try {
            const { user_id, date } = attendanceData;

            // 1. Pengecekan Manual untuk Unique Compound Index [user_id+date]
            const isAlreadyPresent = await db.attendance
                .where('[user_id+date]')
                .equals([user_id, date])
                .first();

            if (isAlreadyPresent) {
                return { 
                    success: false, 
                    message: `Sudah ada data absen untuk user ${user_id} pada tanggal ${date}.` 
                };
            }

            // 2. Simpan ke Dexie
            const id = await db.attendance.add({
                ...attendanceData,
                created_at: new Date().toISOString(),
                sync_status: 'pending' // Flag untuk sinkronisasi nanti
            });

            return { success: true, id };
        } catch (error) {
            console.error("Dexie Error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Mengambil semua data yang belum disinkronkan
     */
    async getUnsynced() {
        return await db.attendance.where('sync_status').equals('pending').toArray();
    },

    async getTodayLocal(userId) {
        const today = new Date().toISOString().split('T')[0];
        return await db.attendance
            .where('[user_id+date]')
            .equals([userId, today])
            .first();
    },

    async markAsSynced(id) {
        return await db.attendance.update(id, { sync_status: 'synced' });
    },

    async deleteSynced(id) {
        return await db.attendance.delete(id);
    }
};