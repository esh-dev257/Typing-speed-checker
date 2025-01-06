import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"], // Match JavaScript and JSX files
    languageOptions: {
      globals: globals.browser, // Include browser globals
      parserOptions: {
        ecmaVersion: "latest", // Use the latest ECMAScript standard
        sourceType: "module", // Enable ES modules
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warn for unused variables
      "react-hooks/exhaustive-deps": "warn", // Warn for missing dependencies in React hooks
      "react/react-in-jsx-scope": "off", // Not needed for modern React (>=17)
      "no-console": "off", // Allow console logs
    },
  },
  pluginJs.configs.recommended, // Use recommended JS rules
  pluginReact.configs.flat.recommended, // Use recommended React rules
];
