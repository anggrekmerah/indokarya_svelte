<script>
import { enhance } from '$app/forms';
</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 class="text-3xl font-bold text-center text-gray-800">Welcome Home!</h1>
                <p class="text-center text-gray-600">You are successfully logged in.</p>
                
                <form action="/login?/logout" method="POST" use:enhance class="flex justify-center">
                    <button
                        type="submit"
                        class="px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Log Out
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>

