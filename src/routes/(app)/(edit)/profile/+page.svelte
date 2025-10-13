<script>
    import { _ } from 'svelte-i18n';
    // Import the page data prop. It will contain user data fetched by +page.server.js
    let { data } = $props(); 

    // Initialize imageUrl state using the fetched data
    let imageUrl = $state(data.user.imageUrl || "https://placehold.co/150x150/e2e8f0/64748b?text=Photo"); 

    /**
     * Handles the file input change event to preview the selected image.
     * @param {Event} event
     */
    function previewFile(event) { 
        const file = event.target.files[0];
        if (file) { 
            const reader = new FileReader();
            reader.onloadend = () => { 
                imageUrl = reader.result; 
            };
            reader.readAsDataURL(file); 
        } else {
            imageUrl = "https://placehold.co/150x150/e2e8f0/64748b?text=Photo";
        }
    }
</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-4xl border border-gray-200">
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2">{$_('Employee Profile')}</h1>
            <p class="text-center text-gray-500 mb-8 text-sm sm:text-base">{$_('Detailed view of employee information')}</p>

            <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8"> 
                <div class="flex flex-col items-center">
                    <div class="w-28 h-28 md:w-40 md:h-40 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                        <img id="previewImage" class="w-full h-full object-cover" src={imageUrl} alt="Employee Photo"> 
                    </div>
                    <p class="mt-4 text-sm text-gray-600 font-medium">{$_('Current Photo')}</p>
                </div>
            </div>

            <hr class="border-t border-gray-200 my-8">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                
                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Full Name')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.name}</p>
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Email Address')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.email}</p>
                </div>
                
                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Phone Number')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.phone_number}</p>
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
                    <p class="text-lg font-semibold text-gray-800">{data.user.birth_date}</p>
                </div>

                <div class="detail-item">
                    <label class="block text-sm font-medium text-gray-500 mb-1">{$_('Gender')}</label>
                    <p class="text-lg font-semibold text-gray-800">{data.user.gender}</p>
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

            </div>
            
            </div>
    </div>
</main>