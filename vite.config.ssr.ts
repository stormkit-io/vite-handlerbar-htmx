import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dotenv from "dotenv";

dotenv.config();
process.env.NODE_ENV = "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  ssr: {
    noExternal: fs
      .readdirSync(path.join(__dirname, "node_modules"), {
        withFileTypes: true,
      })
      .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
      .map((dirent) => new RegExp(dirent.name)),
  },
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: path.resolve(__dirname, "src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".json"],
  },
  build: {
    ssr: true,
    ssrManifest: true,
    minify: false,
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: { server: "src/entry-server.ts" },
      output: {
        dir: ".stormkit/server",
        format: "esm",
        entryFileNames: "[name].mjs",
        preserveModules: true,
        preserveModulesRoot: "src",
        exports: "named",
      },
    },
  },
  define: {
    ...Object.keys(process.env).reduce(
      (obj: Record<string, string>, key: string) => {
        obj[`process.env.${key}`] = JSON.stringify(process.env[key]);
        return obj;
      },
      {}
    ),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/ssr/views/**', // Adjust the source pattern according to your project structure
          dest: "../.stormkit/server/views/",
        },
        {
          src: "public/**",
          dest: "../.stormkit/public",
        },
      ],
    }),
  ],
});
