<script>

let {data} = $props();

</script>

<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">
        <!-- Dashboard Cards Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <!-- Total Closed Tickets Card -->
            <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-emerald-500 transition-transform duration-300 hover:scale-105">
                <div class="flex items-center justify-between">
                    <h3 class="text-md font-semibold text-gray-600">Total Closed Tickets</h3>
                    <div class="text-emerald-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
                <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_totalClosed.total}</span>
                <span class="text-gray-500">/ {data.data_totalClosed.last_month}</span>
            </div>

            <!-- Total Open Tickets Card -->
            <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-500 transition-transform duration-300 hover:scale-105">
                <div class="flex items-center justify-between">
                    <h3 class="text-md font-semibold text-gray-600">Total Open Tickets</h3>
                    <div class="text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                            <line x1="8" y1="16" x2="16" y2="16"></line>
                        </svg>
                    </div>
                </div>
                <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_totalOpen.total} </span>
                <span class="text-gray-500">/ {data.data_totalOpen.last_month}</span>
            </div>

            <!-- Average Time to Done Card -->
            <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-sky-500 transition-transform duration-300 hover:scale-105">
                <div class="flex items-center justify-between">
                    <h3 class="text-md font-semibold text-gray-600">Avg. Time to Done</h3>
                    <div class="text-sky-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 21a9 9 0 007.41-14.79L12 2v5l-4-4"></path>
                        </svg>
                    </div>
                </div>
                <span class="mt-4 text-4xl font-extrabold text-gray-900">{data.data_avgClosed.average_total??0} </span>
                <span class="text-gray-500">/ {data.data_avgClosed.last_month}</span>
            </div>

            <!-- Total by Category Card -->
            <div class="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-violet-500 transition-transform duration-300 hover:scale-105">
                <div class="flex items-center justify-between">
                    <h3 class="text-md font-semibold text-gray-600">Total by Category</h3>
                    <div class="text-violet-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h14l4 4zM16 21V5H4v16M11 5v16"></path>
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex flex-col space-y-2 text-sm text-gray-800">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-red-500">Urgent</span>
                        <span class="font-bold">{data.data_totalLow.total} / {data.data_totalLow.last_month}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-yellow-500">Medium</span>
                        <span class="font-bold">{data.data_totalMedium.total} / {data.data_totalMedium.last_month}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-blue-500">Low</span>
                        <span class="font-bold">{data.data_totalUrgent.total} / {data.data_totalUrgent.last_month}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</main>

