import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite'; // 👈 Importe o Nitro aqui

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro(), // 👈 Adicione o Nitro à lista de plugins
    viteReact()
  ],
});
