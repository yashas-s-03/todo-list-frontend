// to-do-list/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/client',  // output React build into backend/client
    emptyOutDir: true,
  },
});
