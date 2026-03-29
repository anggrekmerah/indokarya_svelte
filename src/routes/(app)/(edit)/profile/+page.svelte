<script>
    import { _ } from 'svelte-i18n';
    import { enhance } from '$app/forms';
    import imageCompression from 'browser-image-compression'; 

    let { data } = $props();

    let isEditing = $state(false);
    let formData = $state({ ...data.user });
    let imageUrl = $state(data.user.image_url || "https://placehold.co/150x150/e2e8f0/64748b?text=Photo"); 
    let compressedFile = $state(null);

    async function handleImageUpload(event) {
        const imageFile = event.target.files[0];
        if (!imageFile) return;

        // Opsi Kompresi
        const options = {
            maxSizeMB: 1,           // Ukuran maksimal 1MB
            maxWidthOrHeight: 1024, // Resolusi maksimal 1024px
            useWebWorker: true
        };

        try {
            // Proses Kompresi
            const compressedBlob = await imageCompression(imageFile, options);
            
            // Konversi kembali ke File object agar bisa dikirim via Form Data
            compressedFile = new File([compressedBlob], imageFile.name, {
                type: imageFile.type,
            });

            // Preview Gambar
            const reader = new FileReader();
            reader.onloadend = () => {
                imageUrl = reader.result;
            };
            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error("Gagal mengompres gambar:", error);
        }
    }

    function previewFile(event) { 
        const file = event.target.files[0]; 
        if (file) { 
            const reader = new FileReader();
            reader.onloadend = () => { 
                imageUrl = reader.result;
                formData.imageUrl = reader.result; 
            };
            reader.readAsDataURL(file); 
        }
    }

    function toggleEdit() {
        if (isEditing) {
            // Logika simpan bisa diletakkan di sini
            console.log("Menyimpan data...", formData);
        }
        isEditing = !isEditing;
    }
</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <form 
        method="POST" 
        enctype="multipart/form-data"
        action="?/updateProfile" 
        use:enhance={({ formData }) => {
            // Jika ada file yang sudah dikompres, masukkan ke formData
            if (compressedFile) {
                formData.set('imageFile', compressedFile); 
            }
            
            return async ({ result }) => {
                if (result.type === 'success') {
                    isEditing = false; 
                    compressedFile = null; 
                    
                    // Ambil path gambar baru dari server jika ada
                    if (result.data?.imageUrl) {
                        imageUrl = result.data.imageUrl;
                    }
                    
                }
            };
        }}
    >
    
    <input type="hidden" name="id" value={data.user.id} />
    <div class="p-4 md:p-6">
        <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-4xl border border-gray-200">
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2">{$_('Employee Profile')}</h1>
            <p class="text-center text-gray-500 mb-8 text-sm sm:text-base">{$_('Detailed view of employee information')}</p>
            
            <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8"> 
                <div class="flex flex-col items-center">
                    <input 
                        type="file" 
                        id="fileInput" 
                        accept="image/*" 
                        onchange={handleImageUpload} 
                        class="hidden" 
                        disabled={!isEditing} 
                        name="imageFile"
                    />
                    
                    <label 
                        for="fileInput" 
                        class="w-28 h-28 md:w-40 md:h-40 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-md {isEditing ? 'cursor-pointer hover:opacity-80 border-4 border-blue-400' : 'cursor-default'}"
                    >
                        <img id="previewImage" class="w-full h-full object-cover" src={imageUrl} alt="Employee Photo"> 
                    </label>
                    
                    <p class="mt-4 text-sm text-gray-600 font-medium">
                        {isEditing ? $_('Click photo to change') : $_('Current Photo')} 
                    </p>
                </div>
            </div>

            <hr class="border-t border-gray-200 my-8">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                
                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Full Name')}</label>
                    <!-- <p class="text-lg font-semibold text-gray-800">{data.user.name}</p> -->
                    <input 
                        type="text" 
                        bind:value={formData.name} 
                        name="name"
                        readonly={!isEditing} 
                        class="text-lg font-semibold text-gray-800 w-full border-b {isEditing ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-transparent'} outline-none transition-all"
                    />
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Email Address')}</label>
                    <!-- <p class="text-lg font-semibold text-gray-800">{data.user.email}</p> -->
                    <input 
                        type="email" 
                        name="email"
                        bind:value={formData.email} 
                        readonly={!isEditing} 
                        class="text-lg font-semibold text-gray-800 w-full border-b {isEditing ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-transparent'} outline-none"
                    />
                </div>
                
                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Phone Number')}</label>
                    <!-- <p class="text-lg font-semibold text-gray-800">{data.user.phone_number}</p> -->
                    <input 
                        type="tel" 
                        name="phone_number"
                        bind:value={formData.phone_number} 
                        readonly={!isEditing} 
                        class="text-lg font-semibold text-gray-800 w-full border-b {isEditing ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-transparent'} outline-none"
                    />
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Address')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.address}</p>
                </div>
                
                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Coordinates')}</label>
                    <p class="text-lg font-semibold text-gray-800">
                        Lat: {data.user.latitude || 'N/A'}, Lng: {data.user.longtitude || 'N/A'}
                    </p>
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Birth Date')}</label>
                    <!-- <p class="text-lg font-semibold text-gray-800">{data.user.birth_date}</p> -->
                    <input 
                        type={isEditing ? "date" : "text"} 
                        name="birth_date"
                        bind:value={formData.birth_date} 
                        readonly={!isEditing} 
                        class="text-lg font-semibold text-gray-800 w-full border-b {isEditing ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-transparent'} outline-none"
                    />
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Gender')}</label>
                    <!-- <p class="text-lg font-semibold text-gray-800">{data.user.gender}</p> -->
                    {#if isEditing}
                        <select name="gender" bind:value={formData.gender} class="text-lg font-semibold text-gray-800 w-full border-b border-blue-500 bg-blue-50 outline-none">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    {:else}
                        <input 
                            type="text" 
                            name="gender"
                            bind:value={formData.gender} 
                            readonly 
                            class="text-lg font-semibold text-gray-800 w-full bg-transparent outline-none"
                        />
                    {/if}
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Title')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.title}</p>
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Employee ID')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.id}</p>
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Group')}</label>
                    {#each data.userGroup as group }
                        <p class="text-lg font-semibold text-gray-800">{group.group_name}</p>
                    {/each}
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Join Date')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.join_date}</p>
                </div>

                <div class="mt-10 flex justify-center gap-4">
                    {#if !isEditing}
                        <button 
                            type="button"
                            onclick={() => isEditing = true}
                            class="px-10 py-3 rounded-full font-bold shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {$_('Edit Profile')}
                        </button>
                    {:else}
                        <button 
                            type="button"
                            onclick={() => { isEditing = false; compressedFile = null; }}
                            class="px-10 py-3 rounded-full font-bold shadow-lg transition-all bg-gray-400 hover:bg-gray-500 text-white"
                        >
                            {$_('Cancel')}
                        </button>
                        <button 
                            type="submit"
                            class="px-10 py-3 rounded-full font-bold shadow-lg transition-all bg-green-600 hover:bg-green-700 text-white"
                        >
                            {$_('Save Changes')}
                        </button>
                    {/if}
                </div>
            </div>
            
            </div>
    </div>
    </form>
</main>