import { Project } from "./Project";
import { Workspace } from "./Workspace";

export interface ExcludeRootOptions {
  project: Project;
}

export function excludeRoot(
  workspaces: Set<Workspace>,
  { project }: ExcludeRootOptions
): Set<Workspace> {
  if (!workspaces.has(project.root)) {
    return workspaces;
  }
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

export function includeDependencies(
  workspaces: Set<Workspace>,
  options: {}
): Set<Workspace> {
  return new Set();
}

export function includeDependents(
  workspaces: Set<Workspace>,
  options: {}
): Set<Workspace> {
  return new Set();
}

export function excludeDependencies(
  workspaces: Set<Workspace>,
  options: {}
): Set<Workspace> {
  return new Set();
}

export function excludeDependents(
  workspaces: Set<Workspace>,
  options: {}
): Set<Workspace> {
  return new Set();
}
