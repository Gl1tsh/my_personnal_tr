import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3002,
    open: false,  // Désactivé pour éviter les conflits
    host: true,   // Permet les connexions externes
    watch: {
      usePolling: true  // Améliore la surveillance des fichiers sous WSL
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020'
  }
});
