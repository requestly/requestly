/* eslint-disable @typescript-eslint/naming-convention */
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for srcv2
 *
 * This configuration enables unit testing with:
 * - React Testing Library (RTL) for component testing
 * - jsdom environment for DOM simulation
 * - Coverage reporting with v8
 * - Path aliases from tsconfig (@v2/*, @v2features/*, @apiClientV2/*)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test-kit/setupTest.ts",
    include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "srcv2/**/*.{ts,tsx}",
        "!srcv2/**/*.{test,spec}.{ts,tsx}",
        "!srcv2/**/__tests__/**",
        "!srcv2/test-kit/**",
        "!srcv2/**/*.config.{ts,js}",
        "!srcv2/**/*.d.ts",
      ],
      exclude: ["srcv2/test-kit/**", "srcv2/**/*.stories.{ts,tsx}", "srcv2/**/index.{ts,tsx}"],
      all: true,
      skipFull: false,
      reportOnFailure: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@v2": path.resolve(__dirname, "."),
      "@v2features": path.resolve(__dirname, "./features"),
      "@apiClientV2": path.resolve(__dirname, "./features/apiClient"),
    },
  },
});
