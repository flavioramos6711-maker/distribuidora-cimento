/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/strict-boolean-expressions": "off",

    // React
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/react-in-jsx-context": "off",
    "react/prop-types": "off",

    // Segurança
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "security/detect-non-literal-regexp": "off",
    "security/detect-non-literal-regexp": "off",

    // Performance
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "*.config.js",
    "*.config.mjs",
    "scripts/",
    "scratch/",
  ],
}
