import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
	],
	build: {
		target: "esnext",
		chunkSizeWarningLimit: 1600,
		cssCodeSplit: true,
		cssMinify: 'lightningcss',
		minify: 'terser',
		outDir: "build",
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes('node_modules')) return

					const parts = id.split('node_modules/')[1].split('/')

					// scoped packages like @mui/material
					const pkgName = parts[0].startsWith('@')
						? `${parts[0]}/${parts[1]}`
						: parts[0]

					return pkgName
				},
			},
		},
	}
})
