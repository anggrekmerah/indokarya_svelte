
import { io } from 'socket.io-client';

const socket = io("https://socketio.appstesting.cloud", { 
            transports: ["websocket", "polling"] ,
            reconnection: true
        });

export const ioClient = socket
