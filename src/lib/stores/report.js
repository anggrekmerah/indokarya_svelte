import { db } from '$lib/stores/dexiedb';

// --- UTILITIES UMUM (Tetap Statis) ---

/**
 * Mengubah FormData menjadi objek JSON yang dapat disimpan di Dexie.
 * (Tidak perlu diubah, karena ini adalah logic serialisasi universal)
 * @param {FormData} formData
 * @returns {Promise<Object>} Objek data yang siap disimpan.
 */
export async function serializeFormData(formData) {
    const serialized = {};
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // Ubah File menjadi ArrayBuffer untuk penyimpanan yang andal
            const buffer = await value.arrayBuffer();
            serialized[key] = {
                data: buffer,
                name: value.name,
                type: value.type,
                isFile: true
            };
        } else {
            serialized[key] = value;
        }
    }
    return serialized;
}

// --- FUNGSI CRUD DINAMIS ---

/**
 * Menyimpan formulir offline secara dinamis ke tabel mana pun.
 * @param {string} table - Nama tabel Dexie ('report', 'tasks', dll.).
 * @param {string | number} primaryKey - Kunci utama unik (misal: id_ticket).
 * @param {string} url - URL action formulir.
 * @param {FormData} formData - Data formulir.
 * @returns {Promise<string | number>} Mengembalikan kunci utama yang disimpan.
 */
export async function saveOfflineTask(table, itemToStore, formData) {
    const serializedData = await serializeFormData(formData);
    
    // Perhatikan: properti ID utama akan dinamakan 'id' di objek yang disimpan.
    itemToStore.data = serializedData;
    
    // Gunakan notasi bracket untuk mengakses tabel secara dinamis
    await db[table].put(itemToStore); // put: menyimpan atau memperbarui
    
}

/**
 * Mengambil tugas offline secara dinamis dari tabel.
 * @param {string} table - Nama tabel Dexie.
 * @param {string | number} primaryKey - Kunci utama yang akan dicari.
 * @returns {Promise<{task: Object, formData: FormData} | null>}
 */
export async function deserializeTask(table, primaryKey) {
    // Cari berdasarkan ID utama
    const task = await db[table].where('id_ticket').equals(primaryKey).toArray();

    if (!task) return null;

    const formData = new FormData();
    // Deserialisasi data kembali ke FormData
    for (const [key, value] of Object.entries(task.data)) {
        if (value.isFile) {
            // Konversi ArrayBuffer kembali menjadi File/Blob
            const file = new File([value.data], value.name, { type: value.type });
            formData.append(key, file, value.name);
        } else {
            formData.append(key, value);
        }
    }
    return { task, formData };
}

/**
 * Menghapus tugas dari tabel secara dinamis.
 * @param {string} table - Nama tabel Dexie.
 * @param {string | number} primaryKey - Kunci utama yang akan dihapus.
 */
export async function deleteOfflineTask(table, primaryKey) {
    // Hapus berdasarkan ID utama
    await db[table].where('id_ticket').equals(primaryKey).delete();
}