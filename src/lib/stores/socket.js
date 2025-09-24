
import { io } from 'socket.io-client';

const socket = io("localhost:3000", { 
            transports: ["websocket", "polling"] ,
            reconnection: true
        });

export const ioClient = socket
// Function to establish the connection
// export function connectSocket() {

    

//     socket.on('connect', () => {
//         console.log('Client successfully connected to Socket.IO server!');
        
//     });

//     return socket

// }