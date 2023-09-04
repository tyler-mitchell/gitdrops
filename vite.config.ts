import path from "path";
import react from "@vitejs/plugin-react";
import million from "million/compiler";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [million.vite({}), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
