<script>
    import { enhance } from '$app/forms';
    import { _ } from 'svelte-i18n';
    // Assuming you have an endpoint that handles the password change POST request.

    // State variables for form inputs
    let oldPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');
    
    // State for user feedback
    let isSubmitting = $state(false);
    let message = $state({ type: '', text: '' }); // { type: 'success'|'error', text: '...' }

    // Client-side validation function before submission
    function validateForm() {
        if (newPassword.length < 8) {
            message = { type: 'error', text: $_('New password must be at least 8 characters long.') };
            return false;
        }
        if (newPassword !== confirmPassword) {
            message = { type: 'error', text: $_('New password and confirmation do not match.') };
            return false;
        }
        message = { type: '', text: '' }; // Clear previous errors
        return true;
    }

    // SvelteKit enhance function for an AJAX submission experience
    const handleSubmit = () => {
        if (!validateForm()) {
            return async ({ update }) => {
                await update({ reset: false });
            };
        }

        isSubmitting = true;
        message = { type: '', text: $_('Changing password...') };

        return async ({ result, update }) => {
            isSubmitting = false;

            if (result.type === 'success') {
                message = { type: 'success', text: $_('Password updated successfully!') };
                // Reset form fields on success
                oldPassword = '';
                newPassword = '';
                confirmPassword = '';
            } else if (result.type === 'failure') {
                // SvelteKit returns a failure when fail() is used in +page.server.js
                const errorText = result.data?.error || $_('An unexpected error occurred.');
                message = { type: 'error', text: errorText };
            } else if (result.type === 'error') {
                // Catch network or server errors
                message = { type: 'error', text: $_('Server Error. Could not connect or change password.') };
            }

            await update({ reset: false });
        };
    };
</script>

<div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-lg border border-gray-200 mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">{$_('Change Password')}</h2>

    <!-- Feedback Message Display -->
    {#if message.text}
        <div 
            class="p-3 mb-4 rounded-lg text-sm transition-all duration-300" 
            class:bg-green-100={message.type === 'success'}
            class:text-green-800={message.type === 'success'}
            class:bg-red-100={message.type === 'error'}
            class:text-red-800={message.type === 'error'}
            role="alert"
        >
            {message.text}
        </div>
    {/if}

    <!-- Form for Password Change -->
    <form method="POST" action="?/changePassword" use:enhance={handleSubmit}>

        <!-- Old Password -->
        <div class="mb-5">
            <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-1">{$_('Current Password')}</label>
            <input 
                type="password" 
                id="oldPassword" 
                name="oldPassword" 
                placeholder="••••••••" 
                bind:value={oldPassword} 
                required
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
        </div>

        <!-- New Password -->
        <div class="mb-5">
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">{$_('New Password')}</label>
            <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                placeholder="••••••••" 
                bind:value={newPassword} 
                required
                minlength="8"
                oninput={() => message = { type: '', text: '' }}
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
            <p class="text-xs text-gray-500 mt-1">{$_('Minimum 8 characters')}</p>
        </div>

        <!-- Confirm New Password -->
        <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">{$_('Confirm New Password')}</label>
            <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                bind:value={confirmPassword} 
                required
                oninput={() => message = { type: '', text: '' }}
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
        </div>

        <!-- Submit Button -->
        <button 
            type="submit" 
            disabled={isSubmitting}
            class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition duration-300 transform active:scale-95 disabled:bg-indigo-400 flex items-center justify-center space-x-2"
        >
            {#if isSubmitting}
                <!-- Simple loading spinner -->
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{$_('Saving...')}</span>
            {:else}
                <span>{$_('Change Password')}</span>
            {/if}
        </button>
    </form>
</div>