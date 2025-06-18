import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
        host: true, // Listen on all addresses
        allowedHosts: ['localhost', '127.0.0.1', 'f4r1s9'] // Add your allowed hosts here
    }
});
