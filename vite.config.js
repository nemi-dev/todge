import { defineConfig } from 'vite';

export default defineConfig({
  // root: 'www',
  build: {
    rollupOptions: {
      input: {
        todge: "todge.html"
      },
      output: {
        // Customize the output filenames
        entryFileNames: '[name].[hash].js',     // Entry points (JavaScript)
        chunkFileNames: '[name].[hash].js',     // Dynamic imports (JavaScript)
        assetFileNames: '[name].[hash][extname]',
        // assetFileNames: ({ name }) => {
        //   if (name.endsWith('.css')) {
        //     return 'assets/css/[name].[hash][extname]';   // CSS files
        //   }
        //   return 'assets/[name].[hash][extname]';         // Other assets like images, fonts
        // },
      },
    },
  },
});
