import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const requiredEnvironmentVariables = ["VITE_API_BASE_URL"] as const;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const missingVariables = requiredEnvironmentVariables.filter(
    (name) => !env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Some environment variables are missing: ${missingVariables.join(", ")}. `,
    );
  }

  return {
    plugins: [react()],
  };
});
