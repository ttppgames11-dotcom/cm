import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Middleware to serve index.html for any legacy .html URL so React Router can handle clean redirect
function legacyHtmlFallbackPlugin() {
  return {
    name: 'legacy-html-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const pathname = req.url.split('?')[0];
          if (pathname.endsWith('.html') && pathname !== '/index.html') {
            req.url = '/index.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), legacyHtmlFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      ignored: ['**/.kilo/**', '**/legacy_html/**', '**/server/db/**']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
