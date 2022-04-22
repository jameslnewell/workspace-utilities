import { satisfies } from "semver";
import { ManifestDependencyKey } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";
import debug from "debug";

const log = debug("@jameslnewell/workspace-utilities:get-dependents");

export interface GetDependentsOptions {
  project: Project;
  keys?: ManifestDependencyKey[];
  recursive?: boolean;
}

export function getDependents(
  workspace: Workspace,
  { project, keys, recursive }: GetDependentsOptions
): Workspace[] {
  const dependents: Workspace[] = [];

  for (const dependentWorkspace of [project.root, ...project.workspaces]) {
    // TODO: ignore self
    const deps = dependentWorkspace.manifest.dependencies(keys);
    const range = deps.get(workspace.name);
    if (range) {
      const satisfied = satisfies(workspace.version, range);
      log(
        `${workspace.name}@${workspace.version} ${
          satisfied ? "satisfies" : "does not satisfy"
        } ${dependentWorkspace.name}'s requirement for ${
          workspace.name
        }@${range}`
      );
      if (satisfied) {
        dependents.push(dependentWorkspace);
        if (recursive) {
          getDependents(dependentWorkspace, {
            project,
            keys,
            recursive,
          }).forEach((w) => dependents.push(w));
        }
      }
    }
  }

  // remove any duplicates
  return Array.from(new Set(dependents));
}
