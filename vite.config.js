import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js'),
        'svg-manager': resolve(__dirname, 'src/svg-manager.js'),
        styles: resolve(__dirname, 'src/styles.css'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'public/manifest.json', dest: '' },
        { src: 'public/svggrabber16.png', dest: '' },
        { src: 'public/svggrabber48.png', dest: '' },
        { src: 'public/svggrabber128.png', dest: '' },
        { src: 'public/getsvgs.html', dest: '' },
      ],
    }),
  ],
  publicDir: 'public', // Serve files directly from the public directory
});
