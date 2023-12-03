import path from "node:path";
import process from "node:process";
import fs from "fs-extra";
import { globbySync } from "globby";
import {
  getWorkspaceRoot as getWorkspaceRootDir,
  getWorkspaces,
} from "workspace-tools";
import type { GlobOption } from "./glob-presets";
import { getGlobOption } from "./glob-presets";
import type { PackageInfo, PackageJson } from "./types";
import { toArray } from "./utils";

export function getRootPackageInfo(): PackageInfo {
  const dirpath = getWorkspaceRootDir(process.cwd()) ?? "";

  const packageJsonPath = path.join(dirpath, "package.json");

  const packageJson = fs.readJsonSync(packageJsonPath);

  return {
    dirpath,
    isRootPackage: true,
    name: packageJson.name,
    packageJson,
    tsconfigPaths: getTsconfigPaths(dirpath),
  };
}

export function getProjects(
  { withRoot = true } = { withRoot: true }
): PackageInfo[] {
  const projects = getWorkspaces(process.cwd()).map((e): PackageInfo => {
    return {
      name: e.name,
      packageJson: e.packageJson,
      dirpath: e.path,
      tsconfigPaths: getTsconfigPaths(e.path),
      isRootPackage: false,
    };
  });

  const packageInfo = getRootPackageInfo();

  if (withRoot) projects.unshift(packageInfo);

  return projects;
}

function getTsconfigPaths(cwd: string): string[] | undefined {
  return globbySync("tsconfig.*.json", { cwd });
}

export function packageFileGlob({
  packageInfo,
  glob,
}: {
  packageInfo: PackageInfo;
  glob?: GlobOption;
}) {
  return path.join(packageInfo.dirpath, getGlobOption(glob));
}

export function packageDependencyCheck({
  packageJson,
  name,
}: {
  packageJson: PackageJson;
  name: string | string[];
}) {
  return toArray(name).some((n) => n in (packageJson.dependencies ?? {}));
}
