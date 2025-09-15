import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { browser } from '$app/environment';

// Use a writable store to hold the socket instance
export const socketStore = writable(null);

// Function to establish the connection
export function connectSocket() {
    // Only connect if we are on the client-side and a connection doesn't exist
    
    if (browser ) {
        const socket = io("http://localhost:3000", { 
        transports: ["websocket", "polling"] ,
        reconnection: true
        }); // Adjust URL to your server
        socketStore.set(socket);
        console.log('Socket.IO client connected');

        // Optional: Listen for a 'connect' event to confirm
        socket.on('connect', () => {
            console.log('Client successfully connected to Socket.IO server!');
            
        });
    }
}