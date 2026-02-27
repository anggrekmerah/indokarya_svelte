<script>
    import { _ } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { Lock, User, MapPin, Phone, MessageSquare, FileText, Route, RouteOff, CheckCircle, ChevronDown, ChevronUp, PenSquare, XCircle, Camera, Video, Trash2, FilePlus, RefreshCcw, CameraOff, Play, StopCircle, VideoOff, LoaderCircle, ClipboardList } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { Loader } from '@googlemaps/js-api-loader';
    import { afterNavigate } from '$app/navigation';
    // import { ioClient } from '$lib/stores/socket.js'; // Commented out as store definition is not provided

    // Data passed from SvelteKit server load function. 
    let { data, form } = $props();

    
    // Use the provided data or the mock data if 'data' is undefined/empty
    const detailTicket = (data && data.detailTicket) ? data.detailTicket : {};


    let isInfoExpanded = $state(true);
    let isMapExpanded = $state(false);
    let isHistoryExpanded = $state(true);
    let isVideoModalOpen = $state(false);
    let currentVideoUrl = $state(null);
    let isPhotoModalOpen = $state(false);
    let currentPhotoUrl = $state(null);


    function openVideoModal(url) {
        currentVideoUrl = url;
        isVideoModalOpen = true;
    }

    function closeVideoModal() {
        currentVideoUrl = null;
        isVideoModalOpen = false;
    }

    function openPhotoModal(url) {
        currentPhotoUrl = url;
        isPhotoModalOpen = true;
    }

    function closePhotoModal() {
        currentPhotoUrl = null;
        isPhotoModalOpen = false;
    }

    // --- Data Preparation Function ---
    function prepareTicketData(detailTicket) {
        let structuredMachines = [];
        
        // Remove HTML entities from address
        if (detailTicket.cust_address) {
            detailTicket.cust_address = detailTicket.cust_address.replace(/&#x2F;/g, '/');
        }

        // 1. Process TicketMachine to structure data per machine
        if (detailTicket.TicketMachine && detailTicket.TicketMachine.length > 0) {
            detailTicket.TicketMachine.forEach(machine => {
                const photos = (machine.Photos || []).map(p => ({
                    type: 'photo',
                    url: p.res_photo.replace(/^\.\/static/, ''),
                    caption: `Photo: ${machine.machine_name}`
                }));

                const videos = (machine.Videos || []).map(v => ({
                    type: 'video',
                    url: v.res_video.replace(/^\.\/static/, ''),
                    caption: `Video: ${machine.machine_name}`,
                    // Use the first photo as a generic preview if available
                    preview: photos.length > 0 ? photos[0].url : null 
                }));

                const spareparts = (machine.Spareparts || []).map(part => ({
                    name: part.sparepart_name,
                    qty: 1, // Assuming quantity 1 if not specified
                }));

                structuredMachines.push({
                    machine_name: machine.machine_name,
                    machine_type: machine.brand + '-' + machine.serial_number,
                    id_ticket_machine: machine.id_ticket_machine,
                    media: [...photos, ...videos],
                    spareparts: spareparts
                });
            });
        }
        
        // 2. Status History & Comments
        const history = (detailTicket.TicketAction || []).map((action, index) => ({
            status_name: action.status_name,
            actor: action.ticket_descriptions == 'By System' ? 'System' : 'Technician', 
            timestamp: new Date(action.created_datetime).toLocaleString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            }),
            comment: action.ticket_descriptions
        }));

        // 3. Customer Acceptance Signature
        const signature = detailTicket.TicketSignature && detailTicket.TicketSignature.length > 0 ? {
            url: detailTicket.TicketSignature[0].path_signature.replace(/^\.\/static/, ''),
            signer_name: 'Customer Signature', // Placeholder
            timestamp: new Date(detailTicket.TicketAction.find(a => a.status_name === 'Closed')?.created_datetime || new Date()).toLocaleString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            })
        } : null;

        return {
            detailTicket,
            machines: structuredMachines,
            history,
            signature
        };
    }
    
    // Process the data immediately
    const ticketData = prepareTicketData(detailTicket);

    // Google Map Logic (assuming data.mapsKey and data.mapsId are passed from load function)
    let directionsService;
    let directionsRenderer;
    let google;
    let defMap;
    let mapElement;
    let pinElement;
    
    let watchOriginMarked = $state(false);
    

    const centerMarker = { lat:parseFloat(ticketData.detailTicket.cust_latitude), lng: parseFloat(ticketData.detailTicket.cust_longtitude) }
    const mapID = data?.mapsId || 'YOUR_DEFAULT_MAP_ID';
    const mapsKey = data?.mapsKey || 'YOUR_GOOGLE_MAPS_API_KEY';
    const bikeIconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJpa2UtaWNvbiBsdWNpZGUtYmlrZSI+PGNpcmNsZSBjeD0iMTguNSIgY3k9IjE3LjUiIHI9IjMuNSIvPjxjaXJjbGUgY3g9IjUuNSIgY3k9IjE3LjUiIHI9IjMuNSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNSIgcj0iMSIvPjxwYXRoIGQ9Ik0xMiAxNy41VjE0bC0zLTMgNC0zIDIgM2gyIi8+PC9zdmc+`
    const pinOpt = {
        background: "#00a2ff", // Red background
        borderColor: "#033552", // Black border
        glyph: new URL(bikeIconSvg), // Star symbol
        glyphColor: "#033552", // White glyph
        scale: 1 // Larger size
    };

    const mapsConf = {
            apiKey:mapsKey,
            mapIds:mapID,
            version: 'weekly',
            libraries: ['maps','marker','places','routes','geometry']
        }
        console.log('mapsConf history')
        console.log(mapsConf)
    let mapsLoader;
    if (typeof window !== 'undefined') {
        mapsLoader = new Loader(mapsConf);
    }

    onMount( async () => {
        // Load google maps only if keys are provided
        if (mapsKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            console.error("Google Maps API Key is not set. Map will not load.");
            return;
        }
    
        try {

            google = await mapsLoader.load();

            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")
            const { LatLng } = await google.maps.importLibrary("core");
            const { DirectionsRenderer } = await google.maps.importLibrary("routes");
            pinElement = new google.maps.marker.PinElement(pinOpt);

            // 2. Initialize the map and renderer
            defMap = await new Map(mapElement, {
                center: centerMarker,
                zoom: 13,
                mapId: mapID
            });
            
            await new AdvancedMarkerElement({
                map: defMap,
                position: centerMarker,
                title: ticketData.detailTicket.cust_name,
            })

            directionsRenderer = new DirectionsRenderer({
                map: defMap,
                suppressMarkers: true
            });

            // 3. Get the initial location and set up the route
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
                    
                    await calculateAndDisplayRoute(origin, centerMarker);
                },
                (error) => console.log("Could not get user's initial location:", error.message),
                {
                    enableHighAccuracy: true,
                    timeout: 60000,
                    maximumAge: 0
                }
            );
            
                
        } catch (e) {
            console.error('Error loading Google Maps', e);
        }
        
    });

    function handleToggleMap() {
        isMapExpanded = !isMapExpanded;
        watchOriginMarked = isMapExpanded; // Start watching when map is expanded
    }

    async function calculateAndDisplayRoute(origin, destination) {
        if (!google) return; // Wait for Google Maps to load
        
        const { DirectionsService } = await google.maps.importLibrary("routes");
        const directionsService = new DirectionsService();

        directionsService.route(
            { 
                origin, 
                destination, 
                travelMode: google.maps.TravelMode.DRIVING ,
                avoidTolls:true,
                avoidHighways:true,
                avoidFerries:true,
                drivingOptions: {
                    departureTime: new Date(Date.now()),
                    trafficModel: 'bestguess'
                },
            },
            async (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(response);
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            }
        );
    }
</script>

<svelte:head>
    <title>{$_('Task Details')}</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
    <!-- Map Section -->
    <section class="w-full flex-shrink-0 relative border-b-2 border-[#407ad6]" class:h-[70vh]={isMapExpanded} class:h-48={!isMapExpanded} transition:slide={{ duration: 300 }}>
      <!-- The map element itself -->
      <div class="w-full h-full" bind:this={mapElement}>
        <!-- Map content goes here -->
        {#if mapsKey === 'YOUR_GOOGLE_MAPS_API_KEY' && !mapElement}
            <div class="h-full w-full flex items-center justify-center bg-gray-200 text-gray-600">
                Map not loaded. Please set the Google Maps API Key.
            </div>
        {/if}
      </div>
      <!-- Map Toggle Button -->
      <section class="flex flex-initial items-center justify-center">
        <button onclick={handleToggleMap}
        class=" -translate-y-3
               flex items-center justify-center w-10 h-10 rounded-full
               bg-[#407ad6] text-white font-semibold shadow-xl
               hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
               aria-label={isMapExpanded ? 'Collapse Map' : 'Expand Map'}>
        {#if !isMapExpanded}
          <Route class="w-6 h-6" />
        {:else}
          <RouteOff class="w-6 h-6" />
        {/if}
      </button>
      </section>
      
    </section>

    <!-- Content Section -->
    <div class="max-w-xl mx-auto space-y-6 py-6 px-4 pb-20 flex-grow w-full">
        <!-- Ticket Information -->
        <section class="bg-white rounded-xl shadow-lg border border-gray-100">
            <header class="flex justify-between items-center p-5 pb-0 cursor-pointer" onclick={() => isInfoExpanded = !isInfoExpanded}>
                <h2 class="text-xl font-bold text-gray-900">
                    {$_('Ticket Details')}
                </h2>
                {#if isInfoExpanded}
                    <ChevronUp class="w-5 h-5 text-gray-500" />
                {:else}
                    <ChevronDown class="w-5 h-5 text-gray-500" />
                {/if}
            </header>
            
            {#if isInfoExpanded}
                <div transition:slide class="p-5 pt-3 space-y-5">
                    <div class="space-y-3">
                        <h3 class="text-xl font-bold text-gray-900">
                            {ticketData.detailTicket.ticket_tittle} 
                        </h3>
                        
                        <p class="text-sm text-gray-500 font-light">
                            {$_('Task ID')}: <span class="font-medium text-gray-700">#{ticketData.detailTicket.id_ticket}</span>
                        </p>
                        <p class="text-sm text-gray-500 font-light">
                            {$_('Priority')}: 
                            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset" style="background-color: {ticketData.detailTicket.priority_color}1a; color: {ticketData.detailTicket.priority_color}; border-color: {ticketData.detailTicket.priority_color}4d;">
                                {$_(ticketData.detailTicket.priority_name)}
                            </span>
                        </p>
                        <p class="text-sm text-gray-500 font-light">
                            {$_('Status')}: 
                            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset" style="background-color: {ticketData.detailTicket.status_color}1a; color: {ticketData.detailTicket.status_color}; border-color: {ticketData.detailTicket.status_color}4d;">
                                {$_(ticketData.detailTicket.status_name)}
                            </span>
                        </p>

                        {#if ticketData.detailTicket.id_sub_ticket}
                            <p class="text-sm text-gray-500 font-light">
                                {$_('Parent')}: <a href="/ticket/{ticketData.detailTicket.id_sub_ticket}"><span class="font-medium text-blue-700">#{ticketData.detailTicket.id_sub_ticket}</span></a>
                            </p>  
                        {/if}
                        
                        <p class="text-base text-gray-700 pt-2">
                            <span class="font-bold">{$_('Description')}:</span> {ticketData.detailTicket.ticket_description}
                        </p>
                    </div>

                    <hr class="border-gray-200">

                    <div class="space-y-3 text-sm text-gray-600">
                        <h4 class="font-semibold text-gray-900 flex items-center"><User class="w-4 h-4 mr-2"/> {$_('Customer')}</h4>
                        <p class="font-bold">
                            {ticketData.detailTicket.cust_name}
                        </p>
                        <p class="flex items-start">
                            <MapPin class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500"/>
                            {ticketData.detailTicket.cust_address}
                        </p>
                        <a href={`tel:${ticketData.detailTicket.cust_phone}`} class="flex items-center text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                            <Phone class="w-4 h-4 mr-2"/>
                            {ticketData.detailTicket.cust_phone}
                        </a>
                    </div>
                </div>
            {/if}
        </section>

        <!-- History and Machine Details -->
        <section class="bg-white rounded-xl shadow-lg border border-gray-100">
            <header class="flex justify-between items-center p-5 cursor-pointer" onclick={() => isHistoryExpanded = !isHistoryExpanded}>
                <h2 class="text-xl font-bold text-gray-900">
                    {$_('Service Report')}
                </h2>
                {#if isHistoryExpanded}
                    <ChevronUp class="w-5 h-5 text-gray-500" />
                {:else}
                    <ChevronDown class="w-5 h-5 text-gray-500" />
                {/if}
            </header>
            
            {#if isHistoryExpanded}
                <div transition:slide class="p-5 pt-0 space-y-8">

                    <!-- Status History & Comments -->
                    <div class="space-y-4">
                        <h3 class="flex items-center text-md font-bold text-gray-900 border-b pb-2"><RefreshCcw class="h-4 w-4 mr-2 text-blue-500"/> {$_('Status Timeline')}</h3>
                        
                        {#if ticketData.history && ticketData.history.length > 0}
                            <div class="relative pl-6">
                                <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                {#each ticketData.history.toReversed() as item}
                                    <div class="relative mb-6">
                                        <!-- Timeline dot -->
                                        <div class="absolute -left-2 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <div class="ml-4">
                                            <div class="flex items-center justify-between text-xs text-gray-500">
                                                <span class="font-medium">{item.actor}</span>
                                                <span>{item.timestamp}</span>
                                            </div>
                                            <p class="font-semibold text-gray-800">{item.status_name}</p>
                                            <p class="text-sm text-gray-600 italic mt-0.5">
                                                {item.comment || $_('No comment.')}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-sm text-gray-500 italic">{$_('No history available for this ticket.')}</p>
                        {/if}
                    </div>

                    <!-- --- START MACHINE SERVICE REPORTS (NEW STRUCTURE) --- -->
                    <div class="space-y-6">
                        <h3 class="flex items-center text-xl font-bold text-gray-900 border-b pb-2">
                            <ClipboardList class="h-5 w-5 mr-2 text-purple-600"/> {$_('Machine Service Details')}
                        </h3>
                        
                        {#if ticketData.machines && ticketData.machines.length > 0}
                            {#each ticketData.machines as machine}
                                <div class="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                                    <h4 class="font-bold text-lg text-gray-900 border-b pb-2 mb-3">
                                        {machine.machine_name} 
                                        <span class="text-sm font-normal text-gray-500">({machine.machine_type})</span>
                                    </h4>

                                    <!-- Spare Parts for this Machine -->
                                    <div class="space-y-2 mb-4">
                                        <h5 class="flex items-center text-md font-semibold text-gray-800"><FilePlus class="h-4 w-4 mr-2 text-red-500"/> {$_('Spare Parts Used')}</h5>
                                        {#if machine.spareparts.length > 0}
                                            <ul class="divide-y divide-gray-100 pl-4">
                                                {#each machine.spareparts as part}
                                                    <li class="py-1 flex justify-between items-center text-sm text-gray-700">
                                                        <span>{part.name}</span>
                                                        <span class="font-semibold text-gray-600">x{part.qty}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {:else}
                                            <p class="text-sm text-gray-500 italic pl-4">{$_('No spare parts recorded for this machine.')}</p>
                                        {/if}
                                    </div>

                                    <!-- Photos & Videos for this Machine -->
                                    <div class="space-y-2">
                                        <h5 class="flex items-center text-md font-semibold text-gray-800"><Camera class="h-4 w-4 mr-2 text-orange-500"/> {$_('Photos & Videos')}</h5>
                                        
                                        {#if machine.media.length > 0}
                                            <div class="grid grid-cols-2 gap-3 pl-4">
                                                {#each machine.media as mediaItem}
                                                    <div class="relative overflow-hidden rounded-lg shadow-md border border-gray-200">
                                                        {#if mediaItem.type === 'photo'}
                                                            <!-- Image placeholder as we don't have static paths working here -->
                                                            <div class="relative cursor-pointer" 
                                                                onclick={() => openPhotoModal(mediaItem.url)}
                                                            >
                                                                <img 
                                                                    src={mediaItem.url} 
                                                                    alt={mediaItem.caption} 
                                                                    class="w-full h-32 object-cover"
                                                                >
                                                                
                                                                <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-2 pointer-events-none">
                                                                    <p class="text-xs text-white font-medium truncate">{mediaItem.caption}</p>
                                                                </div>
                                                            </div>
                                                        {:else if mediaItem.type === 'video'}
                                                            <div class="w-full h-32 relative cursor-pointer" onclick={() => openVideoModal(mediaItem.url)}>
                                                                <!-- Video poster/preview placeholder -->
                                                                <div class="w-full h-full object-cover flex items-center justify-center bg-gray-900 text-white">
                                                                    Video Preview Unavailable
                                                                </div>
                                                                
                                                                <div class="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
                                                                    <Play class="w-10 h-10 text-white z-10 opacity-80" /> 
                                                                </div>
                                                                <div class="absolute inset-x-0 bottom-0 bg-black bg-opacity-40 flex items-end p-2">
                                                                    <p class="text-xs text-white font-medium truncate"><Video class="w-3 h-3 inline mr-1" />{mediaItem.caption}</p>
                                                                </div>
                                                            </div>
                                                        {/if}
                                                    </div>
                                                {/each}
                                            </div>
                                        {:else}
                                            <p class="text-sm text-gray-500 italic pl-4">{$_('No photos or videos attached for this machine.')}</p>
                                        {/if}
                                    </div>

                                </div>
                            {/each}
                        {:else}
                            <p class="text-sm text-gray-500 italic">{$_('No machine details provided in the report.')}</p>
                        {/if}
                    </div>
                    <!-- --- END MACHINE SERVICE REPORTS --- -->
                    
                    <!-- Customer Acceptance Signature (Kept outside the machine loop) -->
                    <div class="space-y-2">
                        <h3 class="flex items-center text-md font-bold text-gray-900 border-b pb-2"><PenSquare class="h-4 w-4 mr-2 text-green-600"/> {$_('Customer Acceptance')}</h3>
                        
                        {#if ticketData.signature}
                            <div class="border border-gray-300 p-3 rounded-lg bg-gray-50">
                                <!-- Signature image placeholder -->
                                <img 
                                    src={ticketData.signature.url} 
                                    alt="Customer Signature" 
                                    class="w-full max-h-40 object-contain mx-auto border-b border-gray-200 pb-2"
                                >
                                <p class="text-sm font-semibold mt-2 text-center">{ticketData.signature.signer_name}</p>
                                <p class="text-xs text-gray-500 text-center">{$_('Signed on')} {ticketData.signature.timestamp}</p>
                            </div>
                        {:else}
                            <p class="text-sm text-gray-500 italic">{$_('Signature is not yet recorded.')}</p>
                        {/if}
                    </div>

                </div>
            {/if}
        </section>
        
    </div>
</main>

<!-- Video Modal -->
{#if isVideoModalOpen}
    <div 
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        role="dialog" 
        aria-modal="true" 
        onclick={closeVideoModal}
    >
        <div 
            class="w-full max-w-4xl max-h-full bg-black relative">
            <button 
                class="absolute top-2 right-2 z-10 p-2 rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                onclick={closeVideoModal}
                aria-label="Close video player"
            >
                <XCircle class="w-6 h-6" />
            </button>

            <video 
                src={currentVideoUrl} 
                class="w-full h-auto max-h-[80vh] object-contain" 
                controls 
                autoplay 
                preload="auto"
                tabindex="0"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    </div>
{/if}

<!-- Photo Modal -->
{#if isPhotoModalOpen}
    <div 
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        role="dialog" 
        aria-modal="true" 
        onclick={closePhotoModal}
    >
        <div 
            class="w-full max-w-4xl max-h-full bg-black relative">
            <button 
                class="absolute top-2 right-2 z-10 p-2 rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                onclick={closePhotoModal}
                aria-label="Close video player"
            >
                <XCircle class="w-6 h-6" />
            </button>

            <img 
                src={currentPhotoUrl} 
                alt="show" 
                class="w-full h-auto max-h-[80vh] object-contain"
            >
            
        </div>
    </div>
{/if}

<style>
    main {
        background-color: #f9fafb;
    }
    /* Ensure the map section has smooth transitions */
    section[class*="h-"] {
        transition: height 300ms ease-in-out;
    }
</style>
