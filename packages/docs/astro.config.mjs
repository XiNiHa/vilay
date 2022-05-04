import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js'
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [
		solid(),
		// Enable React for the Algolia search component.
		react(),
	],
});
