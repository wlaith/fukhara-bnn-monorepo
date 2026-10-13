import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import withNuxt from "./.nuxt/eslint.config.mjs";

const codeFiles = ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"];

export default withNuxt(defineConfig([
  { ignores: ["dist", "node_modules", "package-lock.json", ".vercel", ".nuxt", ".output"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  { files: ["**/*.{ts,mts,cts,vue}"], extends: [tseslint.configs.recommended] },
  {
    files: ["**/*.vue"],
    extends: [pluginVue.configs["flat/essential"]],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: { "vue/multi-word-component-names": "off" },
  },
  { files: ["**/*.json"], ignores: ["tsconfig.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark", extends: ["markdown/recommended"] },
  { files: ["tsconfig.json"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    languageOptions: { tolerant: true },
    extends: ["css/recommended"],
    rules: { "css/no-invalid-at-rules": "off" },
  },
  { files: ["**/*.spec.ts"], rules: { "import/first": "off" } },
])).onResolved((configs) => {
    for (const config of configs) {
    const globalOnly = Object.keys(config).every((k) => k === "name" || k === "ignores")
    if (!config.files && !config.language && !globalOnly) config.files = codeFiles
  }
})
