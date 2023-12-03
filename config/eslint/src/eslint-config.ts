import type { FlatConfigItem, OptionsConfig } from "@antfu/eslint-config";
import antfu from "@antfu/eslint-config";
import defu from "defu";
import eslintConfigPrettier from "eslint-config-prettier";
import { getProjectConfigs } from "./getProjectConfigs";

type AntfuOptions = OptionsConfig & FlatConfigItem;

const defaultAntfuOptions: AntfuOptions = {
  jsonc: false,
  stylistic: false,
  typescript: true,
  vue: false,
  yaml: false,
  rules: {
    "import/order": "off",
    "sort-imports": "off",
    "unused-imports/no-unused-vars": "off",
  },
  overrides: {
    typescript: {
      "arrow-parens": ["off"],
    },
  },
};

export function defineEslintConfig(antfuOptions?: AntfuOptions) {
  const antfuOpts = defu(antfuOptions, defaultAntfuOptions);

  const projectConfigs = getProjectConfigs((options) => {
    const { eslintConfig, projectFileGlob, isProjectDependency } = options;

    const nextPluginConfig = eslintConfig({
      enabled: isProjectDependency("next"),
      files: [projectFileGlob("glob_src")],
      legacy: {
        extends: "plugin:@next/next/core-web-vitals",
      },
    });

    const tailwindPluginConfig = eslintConfig({
      files: [projectFileGlob("glob_src")],
      legacy: {
        config: {
          extends: ["plugin:tailwindcss/recommended"],
          plugins: ["tailwindcss"],
          rules: {
            "tailwindcss/no-custom-classname": "off",
          },
          settings: {
            tailwindcss: {
              callees: ["cn", "cva"],
              config: "tailwind.config.js",
            },
          },
        },
      },
    });

    return [nextPluginConfig, tailwindPluginConfig];
  });

  return antfu(antfuOpts, ...projectConfigs, eslintConfigPrettier);
}
