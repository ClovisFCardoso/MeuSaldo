import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import tsconfigPaths from 'vite-tsconfig-paths'; // 👈 Adicione esta linha
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tanstackStart(), 
    nitro(), 
    tsconfigPaths(), // 👈 E esta linha também
    tailwindcss(),
    viteReact()
  ],
});