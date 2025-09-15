<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { writable } from 'svelte/store';
  import { socketStore } from '$lib/stores/socket.js';
  import { browser } from '$app/environment';

  // Get data from the load function
    let { data } = $props();

    let messages = $state([]);
    let socket;

    onMount(() => {
        // We subscribe to the store and get the unsubscribe function.
        // This subscription will run immediately.
        const unsubscribe = socketStore.subscribe(value => {
            // First, remove any existing listener if the socket changes
            if (socket) {
                socket.off('ticket');
            }
            
            // Update the local socket variable
            socket = value;

            // Attach the listener only if the new value is a valid socket object
            if (socket) {
                console.log('Socket available. Attaching listener...');
                console.log(data)
                socket.emit('join_user_room', 5);

                socket.on('ticket', (newData) => {
                    messages = [...messages, newData];
                    console.log('New message received:', newData);
                });
            }
        });

        // The onDestroy hook returns the unsubscribe function to clean up the store subscription
        return () => {
            // Unsubscribe from the store to prevent memory leaks
            unsubscribe();
            // Also, make sure to remove the socket listener if it was attached
            if (socket) {
                socket.off('ticket');
            }
        };
    });

    // Svelte's new reactive state primitive
    let showPopup = $state(false);
    let photoTaken = $state(false);
    let photoPreviewUrl = $state('https://placehold.co/150x150/e2e8f0/64748b?text=Photo');
    let videoElement; // Reference to the video element
    let canvasElement; // Reference to the canvas element
    let stream = $state(null);
    let cameraFacingMode = writable('environment');
   
    /**
     * Toggles the visibility of the popup and handles camera stream.
     */
    function togglePopup() {
        showPopup = !showPopup;
        if (showPopup && !stream) {
            startCamera();
        } else {
            stopCamera();
            photoTaken = false;
            photoPreviewUrl = 'https://placehold.co/150x150/e2e8f0/64748b?text=Photo';
        }
    }

    /**
     * Starts the camera and attaches the stream to the video element.
     */
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: cameraFacingMode } }, audio: false });
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }
        } catch (err) {
            console.error("Error accessing the camera:", err);
            // In a real app, you would show a user-friendly error message here
        }
    }

    /**
     * Stops the camera stream.
     */
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    /**
     * Captures a photo from the video feed and displays it on the canvas.
     */
    function handleTakePhoto() {
        if (!videoElement || !canvasElement) return;

        // Set canvas dimensions to match video feed
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Draw the current video frame onto the canvas
        const context = canvasElement.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Get the image data from the canvas
        photoPreviewUrl = canvasElement.toDataURL('image/png');
        photoTaken = true;
        stopCamera(); // Stop the camera after the photo is taken
    }

    /**
     * Placeholder function for the check-in action.
     */
    function handleCheckIn() {
        // Here you would add your logic to submit the data, e.g., to an API
        console.log("Checking in with the following photo:", photoPreviewUrl);
        togglePopup(); // Close the popup after submission
    }

    function switchCamera() {
        // Toggle the camera facing mode
        console.log(cameraFacingMode)
        cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        // Get the new stream with the updated mode
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        startCamera()

    }
</script>
<main class="flex-1 overflow-y-auto pb-20"> 
    <div class="p-4 md:p-6">

      {#each messages as msg}
        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg relative">
          <h4 class="text-md font-bold text-gray-900 mb-2">#TASK0215
              <span class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
                  {$_('Urgent')}
              </span>
              <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {$_('In Progress')}
              </span>
          </h4>
          <h3 class="text-md font-bold text-gray-900 mb-2">Review design mockups</h3>
          <p class="text-sm text-gray-600 mb-6">Finalize UI/UX for the mobile app before the next sprint.</p>

          <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div class="flex items-center">
                  <img
                      class="h-8 w-8 rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
                      src="https://placehold.co/32x32/1e40af/ffffff?text=AC"
                      alt="User avatar"
                  />
                  <span class="ml-2 font-medium text-gray-700">Jane Doe</span>
              </div>
              <div class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
                  </svg>
                  <span class="font-medium text-gray-600">Sep 5, 2025</span>
              </div>
          </div>

          <!-- Locked Overlay with Button -->
          <div id="locked-overlay" class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.243 2 7 4.243 7 7v4H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v4H9V7a3 3 0 013-3z"/>
              </svg>
              <button onclick={togglePopup} class="flex items-center space-x-2 px-6 py-3 bg-white text-gray-800 font-bold rounded-full shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                  <span>{$_('Unlock')}</span>
              </button>
          </div>
      </div>
      {/each}
      <!-- Start Card-->
      <!-- <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"> 
        <h4 class="text-md font-bold text-gray-900 mb-2">#TASK0215  
          <span class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
            Urgent
          </span>
          <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            In Progress
          </span>
        </h4>
        <h3 class="text-md font-bold text-gray-900 mb-2">Review design mockups</h3>
        <p class="text-sm text-gray-600 mb-6">Finalize UI/UX for the mobile app before the next sprint.</p>

        <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div class="flex items-center">
            <img
              class="h-8 w-8 rounded-full ring-2 ring-white transition-transform duration-300 hover:scale-110"
              src="https://placehold.co/32x32/1e40af/ffffff?text=AC"
              alt="User avatar"
            />
            <span class="ml-2 font-medium text-gray-700">Jane Doe</span>
          </div>
          <div class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
            </svg>
            <span class="font-medium text-gray-600">Sep 5, 2025</span>
          </div>
        </div>
      </div>  -->
      <!-- End Card-->

      <!-- Locked Card Container -->
      
      <!-- END Locked Card Container -->

    </div>
</main>

<!-- Use an Svelte @if block to conditionally render the popup -->
{#if showPopup}
    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 flex items-center justify-center">
        <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-[95%] sm:max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{$_('Check In')}</h2>
                <button onclick={togglePopup} class="text-gray-400 hover:text-gray-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form class="space-y-4">
                <!-- Video/Photo Display Section -->
                <div class="flex flex-col items-center relative">
                    <!-- Live video feed -->
                    {#if !photoTaken}
                        <video bind:this={videoElement} class="w-full h-auto rounded-lg shadow-md mb-4" playsinline autoplay></video>
                        <button type="button" onclick={handleTakePhoto} class="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition">
                            {$_('Take Photo')}
                        </button>
                        
                        <!-- Camera switch button -->
                        <button onclick={switchCamera} class="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:bg-white transition">
                            <!-- SVG for camera switch icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 15a8 8 0 100 16-8 8 0 000-16z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 3a.75.75 0 00-.75.75V4.5a.75.75 0 001.5 0v-.75A.75.75 0 0015.75 3z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zM12 21a9 9 0 100-18 9 9 0 000 18zM15.75 3a.75.75 0 00-.75.75V4.5a.75.75 0 001.5 0v-.75A.75.75 0 0015.75 3z" />
                            </svg>
                        </button>
                    {:else}
                        <!-- Captured photo preview -->
                        <div class="w-full h-auto rounded-lg overflow-hidden shadow-md mb-4">
                            <img src={photoPreviewUrl} alt="Captured Photo" class="w-full h-full object-cover"/>
                        </div>
                    {/if}

                    <!-- Hidden canvas for capturing the image -->
                    <canvas bind:this={canvasElement} class="hidden"></canvas>
                </div>

                <!-- Check In Button (only visible after a photo is taken) -->
                {#if photoTaken}
                    <div class="flex justify-center">
                        <button type="submit" class="w-full px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition duration-300 transform hover:scale-105 shadow-lg">
                            {$_('Check In')}
                        </button>
                    </div>
                {/if}
            </form>
        </div>
    </div>
{/if}
