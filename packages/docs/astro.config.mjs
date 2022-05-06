import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js'
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://vilay.xiniha.dev',
	integrations: [
		solid(),
		// Enable React for the Algolia search component.
		react(),
	],
});
