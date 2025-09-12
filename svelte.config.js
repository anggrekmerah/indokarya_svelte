import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter(), csrf: {
			trustedOrigins: ['*']
		} },
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx']
};

export default config;
