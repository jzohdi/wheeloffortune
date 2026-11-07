import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // New in eslint-plugin-react-hooks 7 (via eslint-config-next 16). They flag the existing
      // pages/index.tsx (direct edits of modalData), hooks/useLocalUrl.ts and hooks/useRAFLoop.ts.
      // Warnings, so the dependency upgrade doesn't rewrite app code.
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "test-results/**", "playwright-report/**"]),
]);
