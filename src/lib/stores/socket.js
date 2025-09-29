
import { io } from 'socket.io-client';

const socket = io("https://10.231.77.68:3000", { 
            transports: ["websocket", "polling"] ,
            reconnection: true
        });

export const ioClient = socket
