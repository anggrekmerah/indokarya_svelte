<script>
    import { _ } from 'svelte-i18n';
    import { onMount, onDestroy } from 'svelte';
    import { Lock, User, MapPin, Phone, MessageSquare, FileText, Route, RouteOff, CheckCircle, ChevronDown, ChevronUp, PenSquare, XCircle, Camera, Video, Trash2, FilePlus, RefreshCcw, CameraOff, Play, StopCircle, VideoOff, LoaderCircle } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { Loader } from '@googlemaps/js-api-loader';
    import { afterNavigate } from '$app/navigation';
    import { ioClient } from '$lib/stores/socket.js';
    import { tweened } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { db } from '$lib/stores/dexiedb.js'; 
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { saveOfflineTask } from '$lib/stores/report.js'
    
    let { data, form } = $props();

    let isOnline = $state(navigator.onLine);
    let dataTicket = $state({});

    const reportTable = 'report'
    const checkinTable = 'checkin'
    const lockedTable = 'ticketLocked'
    const unlockTable = 'unlock'

    let report = $state({
        description: '',
        sparePart: [],
        files: [],
        signature: ''
    });
    
    // General ticket data (Notes and final signature, applies to the whole ticket)
    let generalReport = $state({
        generalNotes: '',
        signature: ''
    });

    // --- Video Playback Modal State ---
    let isVideoModalOpen = $state(false);
    let currentVideoUrl = $state(null);

    // Array of reports, one object per machine/asset
    let machineReports = $state([]); 
    
    // Used to track which machine we are currently taking a photo/video for
    let currentMachineId = $state(null);

    let sparePartsList = $state([]); 
    let picsList = $state([]); 
    let lastVisit = $state([]);

    let isInfoExpanded = $state(true);
    let isMapExpanded = $state(false);
    let loadingCheckout = $state(false);
    let alertPopup = $state(false)
    let isTicketLocked = $state(false)
    let isLastVisitModalOpen = $state(false);
    
    let popUpReportLocked = $state(false)
    let RequestReportUnLocked = $state(false)

    let isSignaturePadOpen = $state(false);
    let isCameraPopupOpen = $state(false);
    let currentStream = $state(null);
    let selectedCamera = $state('environment');
    let mediaType = $state('');

    let videoElement = $state(null);
    let canvasElement = $state(null);

    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = $state(false);

    let canvas = $state(null);
    let formElement;
    let fileInput = $state(null);

    let ctx;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // New state for video playback popup
    let isVideoPlayerOpen = $state(false);
    let videoPlayerSrc = $state('');
    let currentPlayingVideoElement = $state(null);

    // Google direction
    let directionsService
    let directionsRenderer
    let google
    let defMap
    let userMarker;
    let mapElement
    let AnimationFrameID = null
    let pinElement
    let wasNearDestination = false;
    
    let watchOriginMarked = $state(false)
    let watchID = $state(false)
    let startMarker = $state(null);
    let isNearDestination = $state(false);
    let userLocation = $state(null);
        // userLocation = { lat: -6.293923670298381, lng: 106.79680552494052 };

    let centerMarker = $state({}) 
    const mapID = data.mapsId
    const mapsKey = data.mapsKey
    const bikeIconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJpa2UtaWNvbiBsdWNpZGUtYmlrZSI+PGNpcmNsZSBjeD0iMTguNSIgY3k9IjE3LjUiIHI9IjMuNSIvPjxjaXJjbGUgY3g9IjUuNSIgY3k9IjE3LjUiIHI9IjMuNSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNSIgcj0iMSIvPjxwYXRoIGQ9Ik0xMiAxNy41VjE0bC0zLTMgNC0zIDIgM2gyIi8+PC9zdmc+`
    const pinOpt = {
        background: "#00a2ff", // Red background
        borderColor: "#033552", // Black border
        glyphSrc: new URL(bikeIconSvg), // Star symbol
        glyphColor: "#033552", // White glyph
        scale: 1 // Larger size
    };
    // Define the tweened store for smooth marker position
    const smoothLocation = tweened({ lat: 0, lng: 0 }, {
        duration: 300, // Duration of the animation in milliseconds
        easing: cubicInOut,
    });

    smoothLocation.subscribe(pos => {
        if (userMarker && pos.lat !== 0 && pos.lng !== 0) {
            userMarker.position = pos;
        }
    });


    // checkIN
    // Svelte's new reactive state primitive
    let in_showPopup = $state(false);
    let in_photoTaken = $state(false);
    let in_photoPreviewUrl = $state('https://placehold.co/150x150/e2e8f0/64748b?text=Photo');
    let in_videoElement = $state(false); // Reference to the video element
    let in_capturedFile = null;
    let in_canvasElement = $state(null); // Reference to the canvas element
    let in_stream = $state(null);
    let in_checkin = $state(null);
    let in_cameraFacingMode = $state('user');


    $effect(async () => {

        console.log('isTicketLocked',isTicketLocked)
        const savableData = {
            description: report.description,
            sparePart: report.sparePart,
            signature: report.signature
        };
        
        sessionStorage.setItem('taskReportData', JSON.stringify(savableData));

        if (isSignaturePadOpen && canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            canvas.addEventListener('touchstart', startDrawing, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            canvas.addEventListener('touchend', stopDrawing);
            
            if (report.signature) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = report.signature;
            }
        }

        if (userLocation) {
            // Create or update the user's marker
            if (!userMarker) {
                userMarker = new google.maps.marker.AdvancedMarkerElement({
                    map: defMap,
                    position: userLocation,
                    content: pinElement.element
                });
            } else {
                userMarker.position = userLocation;
            }

            smoothLocation.set(userLocation); 

            // Calculate and check the distance
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation),
                new google.maps.LatLng(centerMarker)
            );

            isNearDestination = distance <= 100;
            console.log(isNearDestination)
            console.log(`Distance to destination: ${distance.toFixed(2)} meters`);
            console.log(wasNearDestination)

            if(isNearDestination){
                isInfoExpanded = false
            }

            if (wasNearDestination === true && isNearDestination === false) {
                console.log("Technician has left the area. Sending data to server.");
                
                // This function call is what you need to send the data.
                sendLockTaskBeacon();
            }

            wasNearDestination = isNearDestination
        }

    }); // end $effect

    // Fungsi untuk mendaftarkan Background Sync
    async function registerBackgroundSync(tag) {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
            console.warn("Background Sync API tidak didukung. Data hanya akan disimpan.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log(`[OFFLINE] Tugas Background Sync berhasil didaftarkan: ${tag}`);
        } catch (error) {
            console.error('[OFFLINE] Gagal mendaftarkan Background Sync:', error);
        }
    }

    function saveState() {
        sessionStorage.setItem('generalReportData', JSON.stringify(generalReport));
        sessionStorage.setItem('machineReportsData', JSON.stringify(machineReports));
    }

    function loadState() {
        const generalData = sessionStorage.getItem('generalReportData');
        if (generalData) {
            generalReport = JSON.parse(generalData);
        }

        const reportsData = sessionStorage.getItem('machineReportsData');
        if (reportsData) {
            machineReports = JSON.parse(reportsData);
        }
    }

    function findMachineReport(machineId) {
        return machineReports.find(r => String(r.id) === String(machineId));
    }
    
    // The function to send the data
    async function sendLockTaskBeacon() {
        const taskId = dataTicket.id_ticket;
        const payload = JSON.stringify({ id_ticket:taskId });
        console.log(payload)
        // Check if the browser supports sendBeacon before calling
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/ticket/locked', new Blob([payload], { type: 'application/json' }));
            console.log('Task lock beacon sent successfully.');
        } else {
            // Fallback for older browsers (less reliable)
            console.warn('navigator.sendBeacon not supported. Using a less reliable fetch request.');
            fetch('/api/ticket/locked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true // keepalive hint for the browser
            }).catch(error => {
                console.error('Fetch request failed on page exit.', error);
            });
        }
    }

    async function sendLocation(latitude, longitude) {
        const taskId = dataTicket.id_ticket;
        const payload = JSON.stringify({ id_ticket:taskId, lat:latitude, lng:longitude });
        console.log(payload)

        if (navigator.onLine) {
            
            // Check if the browser supports sendBeacon before calling
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/location', new Blob([payload], { type: 'application/json' }));
                console.log('Task lock beacon sent successfully.');
            } else {
                // Fallback for older browsers (less reliable)
                console.warn('navigator.sendBeacon not supported. Using a less reliable fetch request.');
                fetch('/api/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true // keepalive hint for the browser
                }).catch(error => {
                    console.error('Fetch request failed on page exit.', error);
                });
            }
            
        } else {
            await db.timelines.add(
            {
                id_ticket : dataTicket.id_ticket,
                id_user : dataTicket.assignee_id, 
                lat : latitude, 
                lng : longitude,
                timestamp : new Date()
            })
            await registerBackgroundSync('sync-timelines_'+dataTicket.id_ticket);
        }
        
    }

    async function closeAlertPopup() {
        alertPopup = false;
    }

    async function startCamera(type, machineId) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support the MediaDevices API.');
            return;
        }
        
        // Stop any existing stream
        if (currentStream) {
            stopCamera();
        }

        isCameraPopupOpen = true;
        mediaType = type;
        
        const constraints = {
            audio: (type === 'video'),
            video: {
                facingMode: selectedCamera
            }
        };

        try {
            const constraints = {
                video: {
                    facingMode: selectedCamera
                }
            };
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoElement) {
                videoElement.srcObject = currentStream;
            }
            currentMachineId = machineId; // Set the active machine ID
            mediaType = type;
            isCameraPopupOpen = true;
        } catch (err) {
            console.error('Error accessing camera:', err);
            // In a real app, show a friendly error modal instead of alert
            alert('Cannot access camera. Please check permissions.');
        }
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        isCameraPopupOpen = false;
        isRecording = false;
        recordedChunks = [];
    }

    function switchCamera() {
        stopCamera();
        selectedCamera = selectedCamera === 'environment' ? 'user' : 'environment';
        startCamera(mediaType);
    }

    function takePhoto() {
        if (!canvasElement || !videoElement) return;

        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        canvasElement.toBlob(blob => {
            const file = new File([blob], `photo_${Date.now()}.jpeg`, { type: 'image/jpeg' });
            
            const machineReport = findMachineReport(currentMachineId);
            if (machineReport) {
                machineReport.files = [...machineReport.files, { file, type: 'image', preview: URL.createObjectURL(file) }];
                saveState();
            }
            
            stopCamera();
        }, 'image/jpeg');
    }

    function startRecording() {
        if (!currentStream) return;
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(currentStream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });

            const machineReport = findMachineReport(currentMachineId);
            if (machineReport) {
                machineReport.files = [...machineReport.files, { file, type: 'video', preview: URL.createObjectURL(file) }];
                saveState();
            }
            isRecording = false;
            stopCamera();
        };

        mediaRecorder.start();
        isRecording = true;
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function createVideoThumbnail(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                video.currentTime = 1;
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(video.src);
                resolve(canvas.toDataURL('image/jpeg'));
            };
            video.onerror = (e) => {
                reject(e);
            };
        });
    }

    // New functions for video playback
    function openVideoPlayer(file) {
        videoPlayerSrc = URL.createObjectURL(file);
        isVideoPlayerOpen = true;
        // The `on:click` in the template will handle playback.
    }

    function closeVideoPlayer() {
        if (currentPlayingVideoElement) {
            currentPlayingVideoElement.pause();
            currentPlayingVideoElement.currentTime = 0;
            URL.revokeObjectURL(videoPlayerSrc);
        }
        isVideoPlayerOpen = false;
        videoPlayerSrc = '';
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return [x, y];
    }

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
        e.preventDefault();
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const [currentX, currentY] = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        [lastX, lastY] = [currentX, currentY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function clearSignature() {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function saveSignature() {
        const signatureDataURL = canvas.toDataURL('image/png');
        report.signature = signatureDataURL;
        isSignaturePadOpen = false;
        console.log('Signature saved to report object.');
    }

    function cancelSignature() {
        isSignaturePadOpen = false;
    }

    function handleCheckboxChange(event, machineId) { // Added machineId
        const value = event.target.value;
        const checked = event.target.checked;
        
        const machineReport = findMachineReport(machineId);
        
        if (machineReport) {
            if (checked) {
                machineReport.sparePart = [...machineReport.sparePart, value];
            } else {
                machineReport.sparePart = machineReport.sparePart.filter(item => item !== value);
            }
            saveState();
        }
    }

    function openVideoModal(url) {
        currentVideoUrl = url;
        isVideoModalOpen = true;
    }

    function closeVideoModal() {
        currentVideoUrl = null;
        isVideoModalOpen = false;
    }

    // Functionality to prepare media paths for display (only needed if using server data display)
    function getRootRelativePath(path) {
        return path ? path.replace(/^\.\/static/, '') : null;
    }

    function handleFileUpload(event) { // Removed machineId parameter, use currentMachineId set by button click
        const files = Array.from(event.target.files);
        // Use the ID stored when the upload button was clicked
        const machineReport = findMachineReport(currentMachineId); 

        if (machineReport) {
            const newFiles = files.map(file => {
                const type = file.type.startsWith('image/') ? 'image' : 'video';
                return {
                    file,
                    type,
                    preview: URL.createObjectURL(file)
                };
            });
            machineReport.files = [...machineReport.files, ...newFiles];
            saveState();
        }
        // Reset file input value to allow the same file to be selected again
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    function removeFile(fileToRemove, machineId) { // Added machineId
        const machineReport = findMachineReport(machineId);
        if (machineReport) {
            machineReport.files = machineReport.files.filter(f => f !== fileToRemove);
            URL.revokeObjectURL(fileToRemove.preview); // Clean up memory
            saveState();
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        if (!report.signature) {
            console.error("Signature is required to submit the report.");
            return;
        }
        console.log('Final Report:', report);
        sessionStorage.removeItem('taskReportData');
    }

    onDestroy( async () => {

        if (watchID !== null) {
            if (navigator.geolocation) {
                navigator.geolocation.clearWatch(watchID);
                console.log("Geolocation watch cleared.");
            }
        }

        if (AnimationFrameID !== null) {
            cancelAnimationFrame(AnimationFrameID);
            AnimationFrameID = null; // Reset the ID
            console.log('Animation stopped.');
        }
    });


    onMount( async () => {
        console.log($page.params.id)

        try {
            if(isOnline) {
                await db.detailticket.put({id_ticket: $page.params.id, payload:JSON.stringify(data.detailTicket)})
                dataTicket = data.detailTicket
            } else {
                var stringTicket = await db.detailticket.where('id_ticket').equals($page.params.id).toArray()
                console.log(stringTicket)
                dataTicket = JSON.parse(stringTicket[0].payload) 
            }
        } catch (error) {
            var stringTicket = await db.detailticket.where('id_ticket').equals($page.params.id).toArray()
            console.log(stringTicket)
            dataTicket = JSON.parse(stringTicket[0].payload)
        }
        
        loadState(); // Load saved report data

        centerMarker = { lat:parseFloat(dataTicket.cust_latitude), lng: parseFloat(dataTicket.cust_longtitude) }
        in_checkin = dataTicket.ticket_check_in

        // Initialize machineReports based on ticket data
        const machines = dataTicket.machines || [{ id: dataTicket.id_ticket, name: 'Main Ticket Service' }];

        // Initialize report objects for each machine if not loaded from session
        if (machineReports.length === 0 || machineReports.length !== machines.length) {
             machineReports = machines.map(machine => {
                return {
                    id: String(machine.id_ticket_machine), // Ensure BIGINT is treated as a string
                    id_machine : machine.id_machine,
                    name: machine.machine_name || `Machine #${String(machine.id_ticket_machine)}`,
                    description: '',
                    sparePart: [],
                    files: [],
                };
            });
        }
        
        // Initialize the spare parts list from ticket data
        sparePartsList = dataTicket.spareparts || [];
        picsList = dataTicket.pics || [];
        lastVisit = dataTicket.lastVisit || [];

        isTicketLocked = (dataTicket.ticket_locked == 'N') ? false : true

        if (ioClient) {
            ioClient.on('ticketUnlocked', (newData) => {
                console.log('New message received:', newData);
                isTicketLocked = newData.ticket_ulocked ? false : true;
                RequestReportUnLocked = newData.ticket_ulocked ? false : true;
            });
        }

        // Load google maps
        const mapsConf = {
            apiKey:mapsKey,
            mapIds:mapID,
            version: 'weekly',
            libraries: ['maps','marker','places','routes','geometry'] // 'places' is often needed for directions
        }
        
        
        try {
            
            const mapsLoader = new Loader(mapsConf);

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
                title: dataTicket.cust_name,
            })

            directionsRenderer = new DirectionsRenderer({
                map: defMap,
                suppressMarkers: true // We will use a custom marker for the user
            });

            // 3. Get the initial location and set up the route
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log('position current')
                    console.log(position)
                    const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
                    userLocation = origin
                    
                    await sendLocation(position.coords.latitude, position.coords.longitude)
                    
                    // userLocation = { lat: -6.293923670298381, lng: 106.79680552494052 };
                    await calculateAndDisplayRoute(origin, centerMarker);
                    // After the route is set up, start continuous tracking
                    // await watchUserLocation();
                },
                (error) => console.error("Could not get user's initial location:", error),
                {
                    enableHighAccuracy: true,
                    timeout: 60000, // Increase this significantly
                    maximumAge: 30000
                }
            );
            
                
        } catch (e) {
            console.error('Error loading Google Maps', e);
        }

        const savedData = sessionStorage.getItem('taskReportData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            report.description = parsedData.description;
            report.sparePart = parsedData.sparePart;
            report.signature = parsedData.signature;
        }
        
    });

    function handleToggleMap() {
        isMapExpanded = !isMapExpanded;
        watchOriginMarked = !watchOriginMarked
        if (isMapExpanded) {
            // isInfoExpanded = false;
            watchOriginMarked = true
        }
    }

    async function checkDistance(userLocation, destination, radius) {
        
        const {spherical} = await google.maps.importLibrary("geometry")
        // Calculate the distance in meters
        const distance = spherical.computeDistanceBetween(
            userLocation,
            destination
        );

        console.log(`Distance to destination: ${distance.toFixed(2)} meters`);

        // Check if the user is within the geofence and the notification hasn't been sent yet
        if (distance <= radius) {
            console.log("You have entered the destination zone!");

            console.log(AnimationFrameID)
            // Optional: Stop watching the user's position to save battery
            isNearDestination = true
            return false
        } else {
            isNearDestination = false
        } 
    }

    async function  initCurrentPosistion(callback) {
        if (navigator.geolocation) {
            return navigator.geolocation.getCurrentPosition(
                (position) => {

                    const currentPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    callback(currentPos);
                },
                (error) => {
                    // If geolocation fails, show an error message
                    // handleLocationError(true, map, defaultCenter);
                },
                {
                    enableHighAccuracy: true,
                }
            );
        } else {
            // If the browser doesn't support Geolocation
            // handleLocationError(false, map, defaultCenter);
        }
    }    
    
    async function watchUserLocation() {
        if ('geolocation' in navigator) {
            watchID = navigator.geolocation.watchPosition(
                async (position) => {
                    console.log('from watch function')
                    console.log(position)
                    userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

                    await sendLocation(position.coords.latitude, position.coords.longitude)
                    
                },
                (error) => console.error('Geolocation watch error:', error),
                {
                    enableHighAccuracy: true,
                    timeout: 60000, // Increase this significantly
                    maximumAge: 30000
                }
            );
        }
    }

    
    async function interpolatePath(path, numPoints) {
        const newPath = [];
        for (let i = 0; i < path.length - 1; i++) {
            const startPoint = path[i];
            const endPoint = path[i + 1];
            
            // Add the starting point
            newPath.push(startPoint);

            // Interpolate points between the start and end
            for (let j = 1; j <= numPoints; j++) {
            const lat = startPoint.lat() + ((endPoint.lat() - startPoint.lat()) * j) / (numPoints + 1);
            const lng = startPoint.lng() + ((endPoint.lng() - startPoint.lng()) * j) / (numPoints + 1);
            newPath.push(new google.maps.LatLng(lat, lng));
            }
        }
        // Add the final point
        newPath.push(path[path.length - 1]);
        return newPath;
    }

    async function animateMarkerWatch(google, marker, coors) {
        
        console.log(1)
        // Update the marker's position
        marker.position = coors;

        // Recursively call the function on the next frame to continue the animation
        AnimationFrameID = requestAnimationFrame(() => animateMarkerWatch(google, marker, coors));
    }

    async function animateMarker(marker, path, index, speed) {
        // Check if we've reached the end of the path
        if (index >= path.length) {
            // in range 
            userLocation = { lat: -6.293884346171741, lng: 106.79672640071097 };

            // out of range
            // userLocation = { lat: -6.293923670298381, lng: 106.79680552494052 };
            return; 
        }

        console.log(1)
    
        // console.log(marker)
        // Update the marker's position
        marker.position = path[index];
        // await sendLocation(path[index].lat, path[index].lng)
        index += speed
        // Recursively call the function on the next frame to continue the animation
        AnimationFrameID = requestAnimationFrame(() => animateMarker(marker, path, index, speed));
        // requestAnimationFrame(() => animateMarker(marker, path, index, speed));
    }

    async function calculateAndDisplayRoute(origin, destination) {
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
                    departureTime: new Date(Date.now()), // One hour from now
                    trafficModel: 'bestguess'
                },
            },
            async (response, status) => {
                console.log(response)
                if (status === 'OK') {
                    directionsRenderer.setDirections(response);
                    const overviewPath = response.routes[0].overview_path;
                    const animatedPath = await interpolatePath(overviewPath, 10);
                    await animateMarker(userMarker, animatedPath, 0, 1)
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            }
        );
    }


    function handleLocationError(browserHasGeolocation, map, pos) {
        // You can customize this function to display a more user-friendly error
        // For example, display a message in a div on the page
        console.log(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
    }

    async function in_submitPhoto(taskID) {
        if (!in_capturedFile) {
            alert('Please take a photo first.');
            return;
        }

        const formData = new FormData();
        formData.append('photo', in_capturedFile);
        
        // Use fetch to send the data
        const response = await fetch('?/checkin', {
            method: 'POST',
            body: formData
        });

        // Handle the response from the server
        
        const responseUpload = await response.json()
        console.log(responseUpload)
    }

    /**
     * Toggles the visibility of the popup and handles camera stream.
     */
    function in_togglePopup(idTicket) {
        in_showPopup = !in_showPopup;
        if (in_showPopup && !in_stream) {
            in_startCamera();
        } else {
            in_stopCamera();
            in_photoTaken = false;
            in_photoPreviewUrl = 'https://placehold.co/150x150/e2e8f0/64748b?text=Photo';
        }
    }

    /**
     * Starts the camera and attaches the stream to the video element.
     */
    async function in_startCamera() {
        try {
            console.log(in_cameraFacingMode)
            in_stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: in_cameraFacingMode } }, audio: false });
            if (in_videoElement) {
                in_videoElement.srcObject = in_stream;
                in_videoElement.play();
            }
        } catch (err) {
            console.error("Error accessing the camera:", err);
            // In a real app, you would show a user-friendly error message here
        }
    }

    /**
     * Stops the camera stream.
     */
    function in_stopCamera() {
        if (in_stream) {
            in_stream.getTracks().forEach(track => track.stop());
            in_stream = null;
        }
    }

    /**
     * Captures a photo from the video feed and displays it on the canvas.
     */
    function in_handleTakePhoto() {
        if (!in_videoElement || !in_canvasElement) return;

        // Set canvas dimensions to match video feed
        in_canvasElement.width = in_videoElement.videoWidth;
        in_canvasElement.height = in_videoElement.videoHeight;

        // Draw the current video frame onto the canvas
        const context = in_canvasElement.getContext('2d');
        context.drawImage(in_videoElement, 0, 0, in_canvasElement.width, in_canvasElement.height);

        // Get the image data from the canvas
        in_photoPreviewUrl = in_canvasElement.toDataURL('image/png');
        in_photoTaken = true;

        in_canvasElement.toBlob((blob) => {
            // The blob is what you'll send to the server
            in_capturedFile = new File([blob], 'photo.png', { type: 'image/png' });
            
        }, 'image/png', 0.3);
        
        in_stopCamera(); // Stop the camera after the photo is taken
    }

    /**
     * Placeholder function for the check-in action.
     */
    function in_handleCheckIn() {
        // Here you would add your logic to submit the data, e.g., to an API
        console.log("Checking in with the following photo:", in_photoPreviewUrl);
        in_togglePopup(); // Close the popup after submission
    }

    function in_switchCamera() {
        // Toggle the camera facing mode
        console.log(in_cameraFacingMode)
        in_cameraFacingMode = in_cameraFacingMode === 'environment' ? 'user' : 'environment';
        // Get the new stream with the updated mode
        if (in_stream) {
            in_stream.getTracks().forEach(track => track.stop());
        }

        in_startCamera()

    }
    // end checkIN

    function openLastVisitModal() {
        isLastVisitModalOpen = true;
    }

    function closeLastVisitModal() {
        isLastVisitModalOpen = false;
    }

</script>

<svelte:head>
    <title>{$_('Task Details')}</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
    <section class="w-full flex-shrink-0 relative border-b-2 border-[#407ad6]" class:h-[70vh]={isMapExpanded} class:h-48={!isMapExpanded} transition:slide={{ duration: 300 }}>
      <div class="w-full h-full" bind:this={mapElement}>
        
      </div>
      <section class="flex flex-initial items-center justify-center">
        <button onclick={handleToggleMap}
        class=" -translate-y-3
               flex items-center justify-center w-10 h-10 rounded-full
               bg-[#407ad6] text-white font-semibold shadow-xl
               hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        {#if !isMapExpanded}
          <Route class="w-6 h-6" />
        {:else}
          <RouteOff class="w-6 h-6" />
        {/if}
      </button>
      </section>
      
    </section>

    <div class="max-w-xl mx-auto space-y-6 py-6 px-4 pb-20 flex-grow w-full">
      
        {#if !in_checkin && isNearDestination}
            <section class="flex flex-initial items-center justify-center">
                <button
                    type="button"
                    onclick="{in_togglePopup}"
                    class="w-full bg-[#407ad6] text-white justify-center rounded-lg p-3 font-semibold shadow-md flex 
                        hover:bg-blue-700 transition-colors duration-200">
                    <Lock class="h-5 w-5 mr-2" />
                    {$_('Unlock')}
                </button>
            </section>
        {:else if dataTicket.id_ticket_status == 8 && isTicketLocked} 
            <button
                type="button"
                class="w-full flex-1 bg-yellow-500 text-white rounded-lg p-3 font-semibold shadow-md flex items-center justify-center
                    hover:bg-yellow-700 transition-colors duration-200">
                
                <CheckCircle class="h-5 w-5 mr-2" />
                {$_('Pending Unlock Ticket')}
            
            </button>
        {:else if in_checkin && !isNearDestination && !RequestReportUnLocked} 
            <button
                type="submit"
                onclick={() => popUpReportLocked = !popUpReportLocked }
                class="w-full flex-1 bg-red-500 text-white rounded-lg p-3 font-semibold shadow-md flex items-center justify-center
                    hover:bg-yellow-700 transition-colors duration-200">
                
                <CheckCircle class="h-5 w-5 mr-2" />
                {$_('Unlock Ticket')}
            
            </button>
        {/if}
        
        <section class="bg-white rounded-xl shadow-lg border border-gray-100">
            <button onclick={() => isInfoExpanded = !isInfoExpanded}
                class="w-full flex items-center justify-between p-5 text-lg font-semibold text-left
                       rounded-xl transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200">
                <h2 class="flex items-center text-gray-700">
                    <MessageSquare class="h-5 w-5 mr-2 text-green-500" />
                    {$_('Task & Customer Information')}
                </h2>
                {#if isInfoExpanded}
                    <ChevronUp class="h-5 w-5 transition-transform text-gray-500" />
                {:else}
                    <ChevronDown class="h-5 w-5 transition-transform text-gray-500" />
                {/if}
            </button>

            <div class="mt-4 pt-3 border-t border-dashed border-gray-200">
                <button 
                    onclick={openLastVisitModal}
                    class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-[#407ad6] rounded-lg border border-blue-100 hover:bg-blue-100 transition-all text-sm font-semibold"
                >
                    <RefreshCcw class="w-4 h-4" />
                    Lihat 5 Kunjungan Terakhir
                </button>
            </div>
        
        {#if isInfoExpanded}
            <div transition:slide class="p-5 pt-0 space-y-5">
                <div class="space-y-3">
                    <span class="text-md font-bold text-gray-900">
                        {dataTicket.ticket_title}
                    </span>
                    
                
                    <p class="text-sm text-gray-500 font-light">
                        {$_('Task ID')}: <span class="font-medium text-gray-700">#{dataTicket.id_ticket}</span>
                    </p>
                    <p class="text-sm text-gray-500 font-light">
                        {$_('Priority')}: 
                        <span class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
                            {$_(dataTicket.priority_name)}
                        </span>
                    </p>
                    <p class="text-sm text-gray-500 font-light">
                        {$_('Status')}: 
                        <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {$_(dataTicket.status_name)}
                        </span>
                    </p>

                    {#if dataTicket.id_sub_ticket}
                        <p class="text-sm text-gray-500 font-light">
                            {$_('Parent')}: <a href="/ticket/{dataTicket.id_sub_ticket}"><span class="font-medium text-blue-700">#{dataTicket.id_sub_ticket}</span></a>
                        </p>  
                    {/if}
                    
                    <p class="text-sm text-gray-600">
                        <span class="font-bold font-medium">{$_('Description')}:</span> {dataTicket.ticket_description}
                    </p>
                </div>

                <hr class="border-gray-200">

                <div class="space-y-2 text-sm text-gray-600">
                    <h2 class="font-semibold text-gray-900">{$_('Customer')}</h2>
                    
                    <p class="flex items-center font-semibold">
                        {dataTicket.cust_name}
                    </p>

                    <p class="flex items-center">
                        {dataTicket.cust_address}
                    </p>

                    {#if picsList && picsList.length > 0}
                        <div class="space-y-1">
                            <h2 class="font-semibold text-gray-900">{$_('PIC Names')}</h2>
                            {#each picsList as pic}
                                <p class="flex items-center italic">
                                    <span class="mr-1">•</span> {pic['pic_name']}
                                </p>
                            {/each}
                        </div>
                    {/if}

                    <a href={`tel:${dataTicket.cust_phone}`} class="flex items-center text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                        {dataTicket.cust_phone}
                    </a>
                </div>

                <hr class="border-gray-200">
            </div>
        {/if}
        </section>

        {#if in_checkin && isNearDestination && !isTicketLocked }
            
            <!-- General Notes Section -->
            <div class="bg-white rounded-xl shadow-lg p-5 space-y-4 border border-gray-100">
                <h2 class="flex items-center text-lg font-bold text-gray-900">
                    <MessageSquare class="h-5 w-5 mr-2 text-blue-500" /> 
                    {$_('General Ticket Notes')}
                </h2>
                <textarea id="general-notes" bind:value={generalReport.generalNotes} rows="2" class="w-full mt-1 rounded-md border-gray-300 shadow-sm bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="Enter notes or observations for the entire site/ticket (e.g., access issues, overall environment)."
                oninput={saveState}
                ></textarea>
            </div>

            <!-- START OF MACHINE REPORTS LOOP -->
            {#each machineReports as mReport (mReport.id)}
                <section class="bg-white rounded-xl shadow-lg p-5 space-y-6 border-l-4 border-green-500">
                    <h2 class="flex items-center text-xl font-bold text-gray-900 border-b pb-2">
                        <FileText class="h-6 w-6 mr-2 text-green-600" /> 
                        <span class="font-bold ml-1 text-blue-700">Machine: {mReport.name}</span>
                    </h2>

                    <div class="space-y-4">
                        <!-- 1. Report Description (Binds to mReport.description) -->
                        <div>
                            <label for={`report-description-${mReport.id}`} class="text-sm font-medium text-gray-700">{$_('Work Performed / Description')}</label>
                            <textarea 
                                id={`report-description-${mReport.id}`} 
                                bind:value={mReport.description} 
                                oninput={saveState}
                                rows="4" 
                                class="w-full mt-1 rounded-md border-gray-300 shadow-sm bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors" 
                                placeholder="Detail the work specific to this machine."
                            ></textarea>
                        </div>

                        <!-- 2. Spare Parts Used -->
                        {#if sparePartsList.length > 0}
                            <div class="pt-2 border-t border-gray-100">
                                <label class="text-sm font-medium text-gray-700">{$_('Spare Parts Used on this Machine')}</label>
                                <div class="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                                    {#each sparePartsList as part}
                                        {#if part.id_machine == mReport.id_machine}
                                            <div class="flex items-center">
                                                <input 
                                                    id={`spare-part-${mReport.id}-${part.id_ticket_sparepart}`} 
                                                    type="checkbox" 
                                                    value={String(part.id_ticket_sparepart)} 
                                                    onchange={(e) => handleCheckboxChange(e, mReport.id)}
                                                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                                                    checked={mReport.sparePart.includes(String(part.id_ticket_sparepart))} 
                                                />
                                                <label for={`spare-part-${mReport.id}-${part.id_ticket_sparepart}`} class="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    {part.sparepart_name} (P/N: {part.sparepart_part_number || 'N/A'})
                                                </label>
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        <!-- 3. Upload Photos / Videos -->
                        <div class="pt-2 border-t border-gray-100">
                            <label class="text-sm font-medium text-gray-700">{$_('Media Evidence for this Machine')}</label>
                            <div class="flex space-x-2 mt-2">
                                <!-- PASS MACHINE ID to all media functions -->
                                <button onclick={() => startCamera('photo', mReport.id)} type="button" class="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                                    <Camera class="w-4 h-4 mr-2" /> {$_('Photo')}
                                </button>
                                <button onclick={() => startCamera('video', mReport.id)} type="button" class="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                                    <Video class="w-4 h-4 mr-2" /> {$_('Video')}
                                </button>
                                <input type="file" accept="image/*,video/*" multiple class="hidden" bind:this={fileInput} onchange={(e) => handleFileUpload(e, mReport.id)} />
                                <button onclick={() => fileInput.click()} type="button" class="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                                    <FilePlus class="w-4 h-4 mr-2" /> {$_('Upload')}
                                </button>
                            </div>

                            {#if mReport.files.length > 0}
                                <div class="mt-3 flex flex-wrap gap-4">
                                    {#each mReport.files as media}
                                        <div class="relative w-24 h-24 rounded-lg overflow-hidden shadow-md">
                                            {#if media.type === 'image'}
                                                <img src={media.preview} alt="Evidence" class="w-full h-full object-cover">
                                            {:else}
                                                <button onclick={() => openVideoPlayer(media.file)} class="relative w-24 h-24 flex items-center justify-center bg-black rounded-md border overflow-hidden">
                                                    <img src={media.thumbnail} alt={media.file.name} class="w-full h-full object-cover opacity-70" />
                                                    <Play class="absolute w-8 h-8 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            {/if}
                                            <button 
                                                onclick={() => removeFile(media, mReport.id)} 
                                                class="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl-lg hover:bg-red-700 transition-colors"
                                                aria-label="Remove file"
                                            >
                                                <Trash2 class="w-3 h-3" />
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </section>
            {/each}
            <!-- END OF MACHINE REPORTS LOOP -->
            <form method="post" enctype="multipart/form-data" action="?/checkout" class="bg-white rounded-xl shadow-lg p-5 space-y-6 border border-gray-100"
                use:enhance={ async ({formData}) => {
                    loadingCheckout = true;

                    // 1. Append general ticket data (Notes and final signature)
                    formData.append('id_ticket', dataTicket.id_ticket);
                    formData.append('generalNotes', generalReport.generalNotes); 
                    // formData.append('signature', report.signature);
                    formData.append('description', report.description); 

                    // 2. Append all machine reports as a single JSON string
                    const reportsJson = JSON.stringify(machineReports.map(r => ({
                        id: r.id,
                        name: r.name,
                        description: r.description,
                        spareparts: r.sparePart // Array of selected spare part IDs
                    })));
                    formData.append('machineReports', reportsJson); 

                    // 3. Append ALL photos and videos, tagged with their machine ID in the file name
                    let fileIndex = 0;
                    machineReports.forEach(mReport => {
                        mReport.files.forEach(media => {
                            if (media.file instanceof File) {
                                // 1. Get the original extension (e.g., '.jpg', '.mp4')
                                const originalFileName = media.file.name;
                                const extensionMatch = originalFileName.match(/\.[0-9a-z]+$/i);
                                const fileExtension = extensionMatch ? extensionMatch[0] : '';
                                
                                // 2. Create the unique filename WITH the extension
                                const uniqueFileName = `machine_${mReport.id}_file_${fileIndex++}${fileExtension}`;
                                
                                // 3. Append to FormData
                                formData.append('files', media.file, uniqueFileName); 
                                console.log(`Appending file as: ${uniqueFileName}`);
                            }
                        });
                    });

                    // 4. Append the signature (which remains ticket-wide)
                    if (report.signature) {
                        const signatureBlob = await fetch(report.signature).then(res => res.blob());
                        const signatureFile = new File([signatureBlob], 'signature.png', { type: 'image/png' });
                        formData.append('signature', signatureFile);
                    }
                    
                    const handleSuccessfulCheckOut = () => {
                        sessionStorage.removeItem('generalReportData');
                        sessionStorage.removeItem('machineReportsData');
                        sessionStorage.removeItem('taskReportData');
                    }

                    if (!navigator.onLine) {
                        console.log("Saat ini OFFLINE. Menyimpan data formulir secara lokal.");

                        // 1. Simpan Seluruh FormData ke IndexedDB
                        const syncTag = await saveOfflineTask(
                            reportTable, 
                            {
                                id_ticket: dataTicket.id_ticket, // Menggunakan kunci dinamis sebagai ID utama tabel
                                url: '/ticket/checkout',
                                timestamp: new Date()
                            },
                            formData)

                        // 2. Daftarkan tugas Background Sync
                        await registerBackgroundSync('sync-checkout_'+dataTicket.id_ticket);

                        // 3. Tampilkan pesan sukses offline dan batalkan pengiriman fetch
                        loadingCheckout = false;
                        alertPopup = false; // Atau gunakan state lain untuk pesan sukses offline
                        alert("Berhasil disimpan secara lokal. Data akan dikirim saat online.");
                        handleSuccessfulCheckOut()
                        // Mengembalikan objek kosong/non-fetch untuk membatalkan pengiriman SvelteKit.
                        return {
                            result: { type: 'success', status: 202, data: { message: 'Stored offline' } },
                            update: async () => { /* Prevent UI update after local storage */ }
                        };

                    }
                    
                    return async ({ result, update }) => {
                        loadingCheckout = false;

                        if (result.type === 'failure') {
                            alertPopup = true
                        } else {
                            alertPopup = false
                            handleSuccessfulCheckOut()
                        }  
                        
                        // Use update() to handle potential server errors or form failures.
                        update();
                    };
                }}
            >
                <h2 class="flex items-center text-xl font-bold text-gray-900">
                    <FileText class="h-6 w-6 mr-2 text-green-500" />
                    {$_('Task Report')}
                </h2>
                <input type="hidden" name="ID" value="{dataTicket.id_task}">
                <div class="space-y-4">
                    <div>
                        <label for="report-description" class="text-sm font-medium text-gray-700">{$_('Report Description')}</label>
                        <textarea
                        id="report-description"
                        bind:value={report.description}
                        rows="4"
                        class="w-full mt-1 rounded-md border-gray-300 shadow-sm bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        placeholder="Enter a detailed description of the work performed."
                        ></textarea>
                    </div>
                
                    <!-- {#if data.detailTicket.spareparts}
                        <div>
                            <label class="text-sm font-medium text-gray-700">{$_('Spare Parts Used')}</label>
                            <div class="mt-2 space-y-2">
                                {#each data.detailTicket.spareparts as part}
                                    <div class="flex items-center">
                                        <input
                                            id={`spare-part-${part.id_ticket_sparepart}`}
                                            type="checkbox"
                                            value={String(part.id_ticket_sparepart)}
                                            onchange={handleCheckboxChange}
                                            class="..."
                                            checked={report.sparePart.includes(String(part.id_ticket_sparepart))}
                                        />
                                        <label for={`spare-part-${part.id_ticket_sparepart}`} class="ml-2 text-sm text-gray-700 cursor-pointer">
                                            {part.sparepart_name}
                                        </label>
                                    </div>
                                {/each}
                            </div>
                        </div>    
                    {/if} -->
                    
                </div>

                <!-- <div>
                    <label class="text-sm font-medium text-gray-700">{$_('Upload Photos / Videos')}</label>
                    <div class="flex space-x-2 mt-2">
                        <button onclick={() => startCamera('photo')} type="button" class="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                            <Camera class="w-4 h-4 mr-2" />
                            {$_('Take Photo')}
                        </button>
                        <button onclick={() => startCamera('video')} type="button" class="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                            <Video class="w-4 h-4 mr-2" />
                            {$_('Record Video')}
                        </button>
                        <input type="file" accept="image/*,video/*" multiple class="hidden" bind:this={fileInput} onchange={handleFileUpload} />
                        <button onclick={() => fileInput.click()} type="button" class="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                            <FilePlus class="w-4 h-4 mr-2" />
                            {$_('Upload File')}
                        </button>
                    </div>

                    {#if report.files.length > 0}
                        <div class="mt-3 flex flex-wrap gap-4">
                            {#each report.files as media}
                                <div class="relative group">
                                    {#if media.type === 'image'}
                                        <img src={URL.createObjectURL(media.file)} alt={media.file.name} class="w-24 h-24 object-cover rounded-md border" />
                                    {:else if media.type === 'video'}
                                        <button onclick={() => openVideoPlayer(media.file)} class="relative w-24 h-24 flex items-center justify-center bg-black rounded-md border overflow-hidden">
                                            <img src={media.thumbnail} alt={media.file.name} class="w-full h-full object-cover opacity-70" />
                                            <Play class="absolute w-8 h-8 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    {/if}
                                    <button onclick={() => removeFile(media)} class="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-700 shadow-md transition-opacity">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div> -->

                <div class="flex flex-col items-center">
                    <h3 class="text-sm font-medium text-gray-700 mb-2">{$_('Customer Signature')}</h3>
                    <div class="w-full max-w-sm h-32 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                        {#if report.signature}
                            <img src={report.signature} alt="Saved Signature" class="w-full h-full object-contain" />
                        {:else}
                            <button onclick={() => isSignaturePadOpen = true}
                                type="button"
                                class="w-full h-full flex items-center justify-center text-gray-400 text-sm hover:text-gray-600 transition-colors duration-200">
                                <PenSquare class="w-6 h-6 mr-2" />
                                {$_('Add Signature')}
                            </button>
                        {/if}
                    </div>
                </div>

                <div class="flex space-x-3 mt-4">
                <button onclick={clearSignature}
                    type="button"
                    class="flex-1 bg-gray-100 text-gray-800 rounded-lg p-3 font-semibold shadow-sm
                        hover:bg-gray-200 transition-colors duration-200">
                    {$_('Clear Signature')}
                </button>
                    <input type="hidden" name="isNear" value="{isNearDestination}">
                    <button
                        type="submit"
                        disabled={loadingCheckout}
                        class="flex-1 bg-green-600 text-white rounded-lg p-3 font-semibold shadow-md flex items-center justify-center
                            hover:bg-green-700 transition-colors duration-200">
                        {#if loadingCheckout}
                            <LoaderCircle class="h-5 w-5 mr-2" />
                            Loading...
                        {:else}
                            <CheckCircle class="h-5 w-5 mr-2" />
                            {$_('Check Out')}
                        {/if}
                    </button>
                
                </div>
            </form>
        {/if}
    </div>
</main>


<!-- popup signature -->
{#if isSignaturePadOpen}
    <div class="fixed inset-0 w-screen h-dvh bg-gray-50 flex flex-col items-center justify-center p-4 z-50">
      <div class="flex items-center justify-between w-full max-w-lg mb-4">
        <h2 class="text-xl font-bold text-gray-900">{$_('Customer Signature')}</h2>
        <button onclick={cancelSignature} class="text-gray-500 hover:text-gray-700 transition-colors">
          <XCircle class="w-6 h-6" />
        </button>
      </div>

      <div class="w-full max-w-lg flex-grow border border-gray-300 rounded-lg overflow-hidden mb-4 shadow-inner">
        <canvas
          bind:this={canvas}
          class="w-full h-full bg-white cursor-crosshair"
        ></canvas>
      </div>

      <div class="flex space-x-3 w-full max-w-lg">
        <button onclick={clearSignature}
          class="flex-1 bg-gray-100 text-gray-800 rounded-lg p-3 font-semibold shadow-sm
                 hover:bg-gray-200 transition-colors duration-200">
          {$_('Clear')}
        </button>
        <button onclick={saveSignature}
          class="flex-1 bg-blue-600 text-white rounded-lg p-3 font-semibold shadow-md flex items-center justify-center
                 hover:bg-blue-700 transition-colors duration-200">
          {$_('Save')}
        </button>
      </div>
    </div>
{/if}

<!-- popup camera -->
{#if isCameraPopupOpen}
    <div class="fixed inset-0 w-screen h-dvh bg-gray-50 flex flex-col items-center justify-center p-4 z-50">
        <div class="flex items-center justify-between w-full max-w-lg mb-4">
            <h2 class="text-xl font-bold text-gray-900">
                {#if mediaType === 'photo'}
                    {$_('Take a Photo')}
                {:else}
                    {$_('Record a Video')}
                {/if}
            </h2>
            <button onclick={stopCamera} class="text-gray-500 hover:text-gray-700 transition-colors">
            <XCircle class="w-6 h-6" />
            </button>
        </div>

        <div class="w-full max-w-lg flex-grow border border-gray-300 rounded-lg overflow-hidden mb-4 shadow-inner">
            <video bind:this={videoElement} class="w-full h-full object-cover" autoplay playsinline></video>
            <canvas bind:this={canvasElement} class="hidden"></canvas>
        </div>

        <div class="flex space-x-3 w-full max-w-lg">
            <button onclick={stopCamera} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-red-600 text-white hover:bg-red-700 transition-colors">
                <XCircle class="w-6 h-6" />
            </button>
            {#if mediaType === 'photo'}
                <button onclick={takePhoto} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <Camera class="w-6 h-6" />
                </button>
            {:else}
                {#if !isRecording}
                    <button onclick={startRecording} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-red-600 text-white hover:bg-red-700 transition-colors">
                        <Play class="w-6 h-6" />
                    </button>
                {:else}
                    <button onclick={stopRecording} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                        <StopCircle class="w-6 h-6" />
                    </button>
                {/if}
            {/if}
            <button onclick={switchCamera} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                <RefreshCcw class="w-6 h-6" />
            </button>
            
        </div>
    </div>
{/if}

<!-- popup video -->
{#if isVideoPlayerOpen}
    <div class="fixed inset-0 w-screen h-dvh bg-gray-50 flex flex-col items-center justify-center p-4 z-50">
      <div class="flex items-center justify-between w-full max-w-lg mb-4">
        <h2 class="text-xl font-bold text-gray-900">{$_('Play Video')}</h2>
        <button onclick={closeVideoPlayer} class="text-gray-500 hover:text-gray-700 transition-colors">
          <XCircle class="w-6 h-6" />
        </button>
      </div>

      <div class="w-full max-w-lg flex-grow border border-gray-300 rounded-lg overflow-hidden mb-4 shadow-inner">
        <video bind:this={currentPlayingVideoElement} src={videoPlayerSrc} class="w-full h-full bg-black" controls autoplay></video>
      </div>

    </div>
{/if}

<!-- Use an Svelte @if block to conditionally render the popup -->
{#if in_showPopup}
    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 flex items-center justify-center">
        <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-[95%] sm:max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{$_('Check In')}</h2>
                <button aria-label="button" onclick={in_togglePopup} class="text-gray-400 hover:text-gray-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div> 

            <form method="post" action="?/checkin" enctype="multipart/form-data" class="space-y-4" 
            use:enhance={ async ({formData}) => {
                
                if (!in_capturedFile) {
                    alert('Please take a photo first.');
                    return;
                }

                formData.append('photo', in_capturedFile);
                formData.append('id_ticket', dataTicket.id_ticket)
                
                const handleSuccessfulCheckin = () => {
                    // This is the logic that updates the UI state
                    in_showPopup = false; 
                    in_photoTaken = false
                    in_stream = null
                    in_checkin = true
                    isTicketLocked = false
                };
                
                if (!navigator.onLine) {
                    console.log("Saat ini OFFLINE. Menyimpan data formulir secara lokal.");

                    // 1. Simpan Seluruh FormData ke IndexedDB
                    const syncTag = await saveOfflineTask(
                            checkinTable, 
                            {
                                id_ticket: dataTicket.id_ticket, // Menggunakan kunci dinamis sebagai ID utama tabel
                                url: '/ticket/checkin',
                                timestamp: new Date()
                            },
                            formData)

                    // 2. Daftarkan tugas Background Sync
                    await registerBackgroundSync('sync-checkin_'+dataTicket.id_ticket);

                    alert("Berhasil disimpan secara lokal. Data akan dikirim saat online.");
                    handleSuccessfulCheckin()
                    // Mengembalikan objek kosong/non-fetch untuk membatalkan pengiriman SvelteKit.
                    return {
                        result: { type: 'success', status: 202, data: { message: 'Stored offline' } },
                        update: async () => { /* Prevent UI update after local storage */ }
                    };

                }
                
                return async ({ result, update }) => {
                    
                    // Check the result type for success, not the status
                    if (result.type === 'success') {
                        
                        // untuk test
                        setTimeout(function() {
                            // userLocation = { lat: -6.294097629517158, lng: 106.79894726866495 };
                            console.log("This message appears after 2 seconds.");
                        }, 2000); // 2000 milliseconds = 2 seconds
                    
                        handleSuccessfulCheckin()
                    } else {
                        alertPopup = true    
                    }

                    // Always call update() regardless of success or failure
                    // to handle potential server errors or form failures.
                    update();
                };
            }}>
                <!-- Video/Photo Display Section -->
                 
                <div class="flex flex-col items-center relative">
                    <!-- Live video feed -->
                    {#if !in_photoTaken}
                        <video bind:this={in_videoElement} class="w-full h-auto rounded-lg shadow-md mb-4" playsinline autoplay></video>
                        <button type="button" onclick={in_handleTakePhoto} class="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition">
                            {$_('Take Photo')}
                        </button>
                        
                        <!-- Camera switch button -->
                        <button onclick={in_switchCamera} class="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:bg-white transition">
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
                            <img src={in_photoPreviewUrl} alt="Captured Photo" class="w-full h-full object-cover"/>
                        </div>
                    {/if}

                    <!-- Hidden canvas for capturing the image -->
                    <canvas bind:this={in_canvasElement} class="hidden"></canvas>
                </div>

                <!-- Check In Button (only visible after a photo is taken) -->
                {#if in_photoTaken}
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


<!-- notif popup -->
{#if alertPopup}
    <div class="fixed inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
            <h2 class="text-xl font-bold text-red-600">Submission Failed</h2>
            <p>An error occurred while processing your request.</p>
            {#if form?.message}
                <ul class="list-disc list-inside text-red-500">
                        <li>{form.message}</li>
                </ul>
            {/if}
            <div class="flex justify-end">
                <button onclick={closeAlertPopup} type="button" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}


<!-- Popup request unlock report  -->
{#if popUpReportLocked}
<div class="fixed inset-0 w-screen h-dvh bg-gray-50 flex flex-col items-center justify-center p-4 z-50">
    <div class="flex items-center justify-between w-full max-w-lg mb-4">
        <h2 class="text-xl font-bold text-gray-900">
            {$_('Request Unlock Report')}
        </h2>
        <button onclick={() => popUpReportLocked = false} class="text-gray-500 hover:text-gray-700 transition-colors">
        <XCircle class="w-6 h-6" />
        </button>
    </div>
    <form method="post" action="?/unlock_report" class="w-full h-full max-w-lg flex-col flex space-y-4"
        use:enhance={ async ({formData}) => {
            
            formData.append('id_ticket', dataTicket.id_ticket);
            
            const handleSuccessfulUnlock = () => {
                popUpReportLocked = false
                RequestReportUnLocked = true
            }

            if (!navigator.onLine) {
                console.log("Saat ini OFFLINE. Menyimpan data formulir secara lokal.");

                // 1. Simpan Seluruh FormData ke IndexedDB
                const syncTag = await saveOfflineTask(
                        unlockTable, 
                        {
                            id_ticket: dataTicket.id_ticket, // Menggunakan kunci dinamis sebagai ID utama tabel
                            url: '/ticket/unlock_report',
                            timestamp: new Date()
                        },
                        formData)

                // 2. Daftarkan tugas Background Sync
                await registerBackgroundSync('sync-unlock_'+dataTicket.id_ticket);

                alert("Berhasil disimpan secara lokal. Data akan dikirim saat online.");
                
                handleSuccessfulUnlock()
                alertPopup = false
                // Mengembalikan objek kosong/non-fetch untuk membatalkan pengiriman SvelteKit.
                return {
                    result: { type: 'success', status: 202, data: { message: 'Stored offline' } },
                    update: async () => { /* Prevent UI update after local storage */ }
                };

            }
            
            return async ({ result, update }) => {
                console.log(result)

                handleSuccessfulUnlock()
                // Check the result type for success, not the status
                if (result.type === 'failure') {
                    alertPopup = true
                } else {
                    alertPopup = false
                }  

                // Always call update() regardless of success or failure
                // to handle potential server errors or form failures.
                update();
            };
        }}
    >
        <div class="w-full max-w-lg flex-grow border border-gray-300 rounded-lg overflow-hidden mb-4 shadow-inner">
            <textarea
            id="report-description"
            rows="4"
            class="w-full h-full mt-1 rounded-md border-gray-300 shadow-sm bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
            placeholder="Enter a detailed description."
            name="reason_unlocked"
            ></textarea>
        </div>

        <div class="flex space-x-3 w-full max-w-lg">
            <button onclick={() => popUpReportLocked = false} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                {$_('Cancel')}
            </button>
            <button onclick={stopCamera} class="rounded-lg items-center justify-center flex-1 flex p-4 bg-blue-600 text-white hover:bg-red-700 transition-colors">
                {$_('Save')}
            </button>
        </div>
    </form>
</div>
{/if}

<!-- Video Playback Modal -->
{#if isVideoModalOpen}
    <div 
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        role="dialog" 
        aria-modal="true" 
        onclick={closeVideoModal}
    >
        <div 
            class="w-full max-w-4xl max-h-full bg-black relative" 
        >
            <!-- Close Button -->
            <button 
                class="absolute top-2 right-2 z-10 p-2 rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                onclick={closeVideoModal}
                aria-label="Close video player"
            >
                <XCircle class="w-6 h-6" />
            </button>

            <!-- Video Player -->
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


<!-- Last Visit Modal -->
{#if isLastVisitModalOpen}
    <div 
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
    >
        <div 
            transition:slide={{ axis: 'y' }}
            class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        >
            <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div>
                    <h3 class="font-bold text-gray-900 text-lg">Riwayat Kunjungan</h3>
                    <p class="text-xs text-gray-500">Menampilkan 5 aktivitas terakhir</p>
                </div>
                <button onclick={closeLastVisitModal} class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <XCircle class="w-6 h-6 text-gray-400" />
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto space-y-4 bg-white">
                {#each lastVisit as visit, i}
                    <div class="relative pl-6 border-l-2 border-blue-100 pb-2 last:pb-0 last:border-l-0">
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                        
                        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {visit['ticket_check_in'] || 'No Date'}
                                </span>
                                <span class="text-[10px] uppercase tracking-wider font-bold text-green-600">
                                    {visit['machine_req_type']}
                                </span>
                            </div>

                            <h4 class="text-sm font-semibold text-gray-800 flex items-center">
                                <User class="w-3 h-3 mr-1" /> {visit['assignee_name'] || 'Unassigned'}
                            </h4>

                            <p class="text-sm text-gray-600 mt-2 italic leading-relaxed">
                                "{visit['all_notes_and_descriptions']}"
                            </p>

                            {#if visit['all_spareparts']}
                                <div class="mt-3 pt-2 border-t border-dashed border-gray-200">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Spareparts:</p>
                                    <p class="text-xs text-gray-700">{visit['all_spareparts']}</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="p-4 border-t bg-gray-50">
                <button 
                    onclick={closeLastVisitModal}
                    class="w-full py-3 bg-[#407ad6] text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                    Tutup Riwayat
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    main {
        background-color: #f9fafb;
    }
    .aspect-w-16.aspect-h-9 {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
    }
    .aspect-w-16.aspect-h-9 iframe {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
    }
</style>
