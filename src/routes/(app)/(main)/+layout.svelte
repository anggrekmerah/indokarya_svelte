<script>
    let { children } = $props();
</script>


<header class="bg-white shadow p-4 md:p-6 sticky top-0 z-10">
<div class="mb-4 md:mb-0">
    <input type="text" placeholder="Search tasks..." class="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
</div>

<div class="flex justify-between items-center text-sm md:text-base mt-2 md:mt-4">
    <a href="#" class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
    <span class="block">Status</span>
    </a>
    <a href="#" class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
    <span class="block">Date</span>
    </a>
    <a href="#" class="flex-1 text-center py-2 px-1 md:px-4 text-gray-600 hover:text-blue-500">
    <span class="block">Category</span>
    </a>
</div>
</header>
  {@render children?.()}