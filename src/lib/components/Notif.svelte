<script>
    import { goto } from '$app/navigation';
    
    // Asumsi properti ini sudah didefinisikan (e.g., dari parent component)
    export let message; 

    /**
     * Menangani klik: Mengupdate status notifikasi via API lalu navigasi.
     * @param {string} notifId - ID notifikasi yang akan diupdate.
     * @param {string} targetUrl - URL tujuan navigasi.
     */
    async function markAsReadAndNavigate(notifId, targetUrl) {
        // 1. Kirim permintaan API untuk menandai sebagai 'dibaca'
        try {
            const apiEndpoint = '/api/notif/read';
            console.log(notifId)
            const response = await fetch(apiEndpoint, {
                method: 'POST', // Menggunakan POST untuk mengirim data ID
                headers: {
                    'Content-Type': 'application/json',
                    // Tambahkan otentikasi jika diperlukan (misalnya, token JWT)
                },
                // Kirim ID notifikasi dalam body
                body: JSON.stringify({ id: notifId }) 
            });
            

            if (!response.ok) {
                // Notifikasi gagal diupdate di server, tapi kita tetap navigasi
                console.warn(`[API WARN] Gagal mengupdate notifikasi ${notifId}. Status: ${response.status}`);
            }
            
        } catch (error) {
            // Tangani error jaringan, tapi tetap lanjutkan navigasi
            console.error('[API ERROR] Gagal menghubungi API notif/read:', error);
        }

        // 2. Lakukan navigasi ke halaman tujuan
        goto(targetUrl);
    }
</script>

<li class="py-3 hover:bg-gray-50 transition duration-150 cursor-pointer bg-blue-50/50">
    <a 
        href={message.action_link} 
        class="flex items-start space-x-3" 
        onclick="{() => markAsReadAndNavigate(message.id_notif, message.action_link)}"
    >
        <div class="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>

        <div class="flex-grow">
            <p class="text-sm font-semibold text-gray-900">{message.title}</p>
            <p class="text-xs text-gray-600 mt-0.5 line-clamp-2">{message.body}</p>
            
            <p class="text-xs text-blue-500 mt-1">{message.time}</p> 
        </div>
    </a>
</li>