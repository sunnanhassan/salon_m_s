// eslint.config.js
import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  // Ignore build output
  globalIgnores(["dist"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended, // Base JS rules
      reactHooks.configs["recommended-latest"], // React Hooks best practices
      reactRefresh.configs.vite, // React Fast Refresh rules
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Allow variables starting with uppercase (React components, constants)
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
])
