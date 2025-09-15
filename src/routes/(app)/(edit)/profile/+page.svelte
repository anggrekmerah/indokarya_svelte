<script>
    import { enhance } from '$app/forms';
    import { _ } from 'svelte-i18n';
    
    let imageUrl = $state("https://placehold.co/150x150/e2e8f0/64748b?text=Photo");

    /**
     * Handles the file input change event to preview the selected image.
     * @param {Event} event
     */
    function previewFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            // When the file is read, directly assign the result to the state variable.
            // This is the clean, reactive way to update the UI in Svelte 5.
            reader.onloadend = () => {
                imageUrl = reader.result;
            };

            reader.readAsDataURL(file);
        } else {
            // If no file is selected, reset the image to the placeholder.
            imageUrl = "https://placehold.co/150x150/e2e8f0/64748b?text=Photo";
        }
    }
</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-4xl border border-gray-200">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2">{$_('Employee Information')}</h1>
        <p class="text-center text-gray-500 mb-8 text-sm sm:text-base"> </p>

        <form>
            <!-- Photo and Personal Information Section -->
            <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                <!-- Photo Upload -->
                <div class="flex flex-col items-center">
                    <div class="w-28 h-28 md:w-40 md:h-40 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                        <img id="previewImage" class="w-full h-full object-cover" src={imageUrl} alt="Employee Photo Placeholder">
                    </div>
                    <label for="photo" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition">
                        {$_('Upload Photo')}
                    </label>
                    <input type="file" id="photo" class="hidden" accept="image/*" onchange={previewFile}>
                </div>

                <!-- Personal Details -->
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">{$_('Full Name')}</label>
                        <input type="text" id="name" name="name" placeholder="John Doe" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">{$_('Title')}</label>
                        <input type="text" id="title" name="title" placeholder="Software Engineer" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="id" class="block text-sm font-medium text-gray-700 mb-1">{$_('Employee ID')}</label>
                        <input type="text" id="id" name="id" placeholder="EMP-12345" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="group" class="block text-sm font-medium text-gray-700 mb-1">{$_('Group')}</label>
                        <input type="text" id="group" name="group" placeholder="Engineering" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                </div>
            </div>

            <hr class="border-t border-gray-200 my-8">

            <!-- Contact and Other Information Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-1">{$_('Address')}</label>
                    <input type="text" id="address" name="address" placeholder="123 Main St, Anytown" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">{$_('Phone Number')}</label>
                    <input type="tel" id="phone" name="phone" placeholder="(123) 456-7890" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">{$_('Email Address')}</label>
                    <input type="email" id="email" name="email" placeholder="john.doe@example.com" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="birthDate" class="block text-sm font-medium text-gray-700 mb-1">{$_('Birth Date')}</label>
                    <input type="date" id="birthDate" name="birthDate" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="joinDate" class="block text-sm font-medium text-gray-700 mb-1">{$_('Join Date')}</label>
                    <input type="date" id="joinDate" name="joinDate" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">{$_('Gender')}</label>
                    <select id="gender" name="gender" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">{$_('Select')} {$_('Gender')}</option>
                        <option value="male">{$_('Male')}</option>
                        <option value="female">{$_('Female')}</option>
                    </select>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="mt-8 flex justify-center">
                <button type="submit" class="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition duration-300 transform hover:scale-105 shadow-lg">
                    {$_('Update')}
                </button>
            </div>
        </form>
    </div>
    </div>
</main>
