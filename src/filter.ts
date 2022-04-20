import { satisfies } from "semver";
import { ManifestDependencyKey } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

export interface ExcludeRootOptions {
  project: Project;
}

export function excludeRoot(
  workspaces: Set<Workspace>,
  { project }: ExcludeRootOptions
): Set<Workspace> {
  // if we're already ignored it then we don't need to do any work
  if (!workspaces.has(project.root)) {
    return workspaces;
  }

  // remove the root workspace
  const withoutRoot = new Set(workspaces);
  withoutRoot.delete(project.root);
  return withoutRoot;
}

export interface FilterByDiffOptions {}

export function includeChanged(
  workspaces: Workspace[],
  options: FilterByDiffOptions
): Workspace[] {
  return [];
}

export interface GetDependenciesOptions {
  keys?: ManifestDependencyKey[];
  project: Project;
}

export function getDependencies(
  workspace: Workspace,
  { keys, project }: GetDependenciesOptions
): Set<Workspace> {
  const dependencies = new Set<Workspace>();

  const deps = workspace.manifest.dependencies(keys);
  for (const name of deps.keys()) {
    const range = deps.get(name);
    const dependencyWorkspace = project.getWorkspaceByName(name);
    if (
      range &&
      dependencyWorkspace &&
      satisfies(dependencyWorkspace.version, range)
    ) {
      dependencies.add(dependencyWorkspace);
    }
  }

  return dependencies;
}

export interface GetDependentsOptions {
  keys?: ManifestDependencyKey[];
  project: Project;
}

// TODO: support recursive
export function getDependents(
  workspace: Workspace,
  { keys, project }: GetDependenciesOptions
): Set<Workspace> {
  const dependents = new Set<Workspace>();

  for (const dependentWorkspace of project.workspaces) {
    const deps = dependentWorkspace.manifest.dependencies(keys);
    const range = deps.get(workspace.name);
    if (range && satisfies(workspace.version, range)) {
      dependents.add(dependentWorkspace);
    }
  }

  return dependents;
}

export function includeDependencies(
  workspaces: Set<Workspace>,
  options: GetDependenciesOptions
): Set<Workspace> {
  return new Set([
    ...workspaces,
    ...Array.from(workspaces)
      .map((workspace) => Array.from(getDependencies(workspace, options)))
      .flat(),
  ]);
}

export function includeDependents(
  workspaces: Set<Workspace>,
  options: GetDependentsOptions
): Set<Workspace> {
  return new Set([
    ...workspaces,
    ...Array.from(workspaces)
      .map((workspace) => Array.from(getDependents(workspace, options)))
      .flat(),
  ]);
}

export function excludeDependencies(
  workspaces: Set<Workspace>,
  options: GetDependenciesOptions
): Set<Workspace> {
  return new Set();
}

export function excludeDependents(
  workspaces: Set<Workspace>,
  options: GetDependentsOptions
): Set<Workspace> {
  return new Set();
}
