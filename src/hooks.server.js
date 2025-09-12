// src/hooks.server.js
import { UAParser } from 'ua-parser-js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const userAgent = event.request.headers.get('user-agent');
    const {device} = UAParser(userAgent).withClientHints();
    console.log(device)
    event.locals.device = device;

    return resolve(event);
}