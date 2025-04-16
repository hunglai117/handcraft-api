// @ts-check
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const eslintPluginPrettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  prettierConfig,
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2021,
      },
    },
    rules: {
      // TypeScript ESLint rules
      //   '@typescript-eslint/explicit-function-return-type': 'warn',
      //   "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "_" },
      ],

      // Prettier rules
      "prettier/prettier": "error",

      // General rules
      "no-console": "warn",
      "no-return-await": "error",
      curly: ["error", "multi-line"],
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
];
