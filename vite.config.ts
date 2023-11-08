import { defineConfig } from "vite";
import path from "node:path";

// https://vitejs.dev/config/
// for static assets, currently not used for this project
export default defineConfig({
  build: {
    rollupOptions: {
      input: "index.html",
    },
    manifest: true,
    outDir: ".stormkit/public",
  },
  plugins: [],
});
