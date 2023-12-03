import { FlatCompat } from "@eslint/eslintrc";
import { defu } from "defu";
import type { GlobOption, GlobPresetMap } from "./glob-presets";
import { globPresetMap } from "./glob-presets";
import {
  getProjects,
  packageDependencyCheck,
  packageFileGlob,
} from "./package-utils";
import type {
  ESLintFlatConfig,
  FlatCompatOptions,
  LegacyESLintConfig,
  PackageInfo,
} from "./types";
import { toArray } from "./utils";

interface GetProjectConfigCallbackOptions extends PackageInfo {
  projectFileGlob: (glob?: GlobOption) => string;
  isProjectDependency: (name: string | string[]) => boolean;
  eslintConfig: (config: EslintConfigOptions) => ESLintFlatConfig[];
  globPresetMap: GlobPresetMap;
}

export function getProjectConfigs(
  callback: (
    info: GetProjectConfigCallbackOptions
  ) => (ESLintFlatConfig | ESLintFlatConfig[] | undefined)[]
): ESLintFlatConfig[] {
  const projects = getProjects();

  return projects.flatMap((packageInfo) => {
    const { packageJson } = packageInfo;

    const flatConfigs = callback({
      ...packageInfo,
      globPresetMap,
      eslintConfig: (config) => eslintConfig({ ...config }, packageInfo),
      projectFileGlob: (glob) => packageFileGlob({ packageInfo, glob }),
      isProjectDependency: (name) =>
        packageDependencyCheck({ packageJson, name }),
    });

    return flatConfigs.flat().filter(Boolean) as ESLintFlatConfig[];
  });
}

interface LegacyEslintOptions {
  options?: FlatCompatOptions;
  extends?: string[] | string;
  config?: LegacyESLintConfig;
}

interface EslintConfigOptions extends ESLintFlatConfig {
  enabled?: boolean;
  legacy?: LegacyEslintOptions;
}

export function eslintConfig(
  {
    enabled = true,
    legacy,

    ...flatConfig
  }: EslintConfigOptions,
  _packageInfo?: PackageInfo
): ESLintFlatConfig[] {
  if (!enabled) return [];

  const legacyFlatConfig = getLegacyConfig(legacy, _packageInfo);

  return legacyFlatConfig.map((c) => defu(c, flatConfig));
}

function getLegacyConfig(
  legacy?: LegacyEslintOptions,
  _packageInfo?: PackageInfo
) {
  if (!legacy) return [];

  const { dirpath } = _packageInfo ?? {};

  const {
    config: legacyConfig,
    extends: legacyExtends,
    options: flatCompatOptions,
  } = legacy ?? {};

  const defaultCompatOptions: Partial<FlatCompatOptions> = {
    baseDirectory: dirpath,
    resolvePluginsRelativeTo: undefined,
  };

  const compat = new FlatCompat({
    ...defaultCompatOptions,
    ...flatCompatOptions,
  });

  const legacyFlatConfig = legacyConfig ? compat.config(legacyConfig) : [];

  const legacyExtendsFlatConfig = legacyExtends
    ? compat.extends(...toArray(legacyExtends))
    : [];

  return [...legacyFlatConfig, ...legacyExtendsFlatConfig];
}
