# @gitdrops/eslint

Simple ESLint preset

## Installation

```zsh
pnpm install @gitdrops/eslint eslint @antfu/eslint-config
```

## Usage

Define and export the eslint config in `eslint.config.js`

```typescript
import { defineEslintConfig } from "@gitdrops/eslint";

export default defineEslintConfig({
  rules: {
    "import/order": "off",
    "sort-imports": "off",
    "unused-imports/no-unused-vars": "off",
  },
});
```

## Command Line

Add these `package.json`

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## VS Code Settings

Add these settings to `.vscode/settings.json`

```json
{
  "eslint.experimental.useFlatConfig": true,

  "editor.formatOnSave": true,

  "editor.rulers": [100],

  "editor.tabSize": 2,

  "editor.defaultFormatter": "esbenp.prettier-vscode",

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml"
  ]
}
```
