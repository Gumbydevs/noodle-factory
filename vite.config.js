import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
  },
  server: {
    open: '/index.html'
  }
});

export const scripts = {
  dev: "vite",
  build: "vite build",
  preview: "vite preview"
};