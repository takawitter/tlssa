import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/stsa.ts',
      name: 'stsa',
      formats: ["es", "umd"],
      fileName: (format) => `stsa.${format}.js`,      
    },
  },
});
