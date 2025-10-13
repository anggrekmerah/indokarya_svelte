
import { io } from 'socket.io-client';
import { PUBLIC_BASE_URL_WEBSOCKET } from '$env/static/public';

const socket = io(PUBLIC_BASE_URL_WEBSOCKET, { 
            transports: ["websocket", "polling"] ,
            reconnection: true
        });

export const ioClient = socket
