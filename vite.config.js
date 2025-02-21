import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
	plugins: [sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: "Zaparkuj",
				short_name: "Zaparkuj",
				description: "Zaparkuj - predikce a monitoring parkovacích míst",
				theme_color: "#287FFF",
				icons: [
					{
						src: 'favicon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'favicon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'favicon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					}
				]
			}
		})
	]
});
