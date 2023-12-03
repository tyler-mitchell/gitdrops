import type { FlatCompat } from "@eslint/eslintrc";
import type { Linter } from "eslint";
import type { PackageInfo as WorkspaceToolsPackageInfo } from "workspace-tools";

export interface LegacyESLintConfig extends Linter.Config {}

export interface ESLintFlatConfig extends Linter.FlatConfig {}

export interface PackageJson extends WorkspaceToolsPackageInfo {}

export interface PackageInfo {
  name: string;
  packageJson: PackageJson;
  dirpath: string;
  tsconfigPaths?: string[];
  isRootPackage: boolean;
}

export type FlatCompatOptions = NonNullable<
  ConstructorParameters<typeof FlatCompat>[0]
>;
