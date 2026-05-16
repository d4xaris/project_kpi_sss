import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      // /auth/* → backend (no frontend route uses /auth)
      '/auth': 'http://localhost:3000',
      // /game/* → backend, but NOT bare /game (which is the React Router game page)
      '^/game/.+': 'http://localhost:3000',
    },
  },
});
