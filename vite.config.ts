import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/tlssa.ts',
      name: 'tlssa',
      formats: ["es", "umd"],
      fileName: (format) => `tlssa.${format}.js`,      
    },
  },
});
