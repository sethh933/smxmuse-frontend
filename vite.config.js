import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = "http://127.0.0.1:8000";
const backendPrefixes = [
  "/api",
  "/leaderboard1",
  "/leaderboard2",
  "/leaderboard3",
  "/leaderboard4",
  "/season",
  "/countries",
  "/rider",
  "/compare",
];

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      backendPrefixes.map((prefix) => [
        prefix,
        {
          target: backendTarget,
          changeOrigin: true,
        },
      ])
    )
  }
});
