import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";
import hooks from "eslint-plugin-react-hooks";

export default [
  { ignores: [".next/**", "graphql/generated/**", "next-env.d.ts"] },
  {
    files: ["**/*.{js,mjs}"],
    ...js.configs.recommended,
    languageOptions: { globals: { module: "readonly", process: "readonly" } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@next/next": next, "@typescript-eslint": ts, "react-hooks": hooks },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      // Album and avatar URLs are user-provided. The browser fetches them directly
      // rather than proxying remote images through Next.js.
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
];
