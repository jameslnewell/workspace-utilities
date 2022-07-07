import { Workspace } from "./Workspace";
import { satisfies } from "semver";
import { DependencyType } from "./DependencyType";
import { debug } from "./debug";
import { createWorkspacesByName } from "./createWorkspacesByName";
import { Project } from "./Project";

const logger = debug.extend('getDependents')

export interface GetDependentsOptions {
  project: Project
  types?: DependencyType[];
  recursive?: boolean;
}

/**
 * Get a list of workspaces which depend on the specified workspaces
 * @param workspace 
 * @param options 
 * @returns A list of dependent workspaces
 */
export function getDependents(workspace: Workspace, {project, types, recursive}: GetDependentsOptions) {
  const workspacesByName = createWorkspacesByName([project.root, ...project.children])

  // using a set to avoid duplicates
  const workspacesThatDependOnThisWorkspace = new Set<Workspace>();

    // TODO: check for circular references
    for (const dependentWorkspace of Object.values(workspacesByName)) {
      // TODO: ignore self
      const range = dependentWorkspace
        .dependencies(types,)
        .get(workspace.name);
      if (range) {
        const satisfied = satisfies(workspace.version, range);
        logger(
          `${workspace.name}@${workspace.version} ${
            satisfied ? "satisfies" : "does not satisfy"
          } ${dependentWorkspace.name}'s requirement for ${workspace.name}@${range}`
        );
        if (satisfied) {
          workspacesThatDependOnThisWorkspace.add(dependentWorkspace);
          if (recursive) {
              getDependents(dependentWorkspace, {
                project,
                types,
                recursive,
              })
              .forEach((w) => workspacesThatDependOnThisWorkspace.add(w));
          }
        }
      }
    }

  return Array.from(workspacesThatDependOnThisWorkspace)
}
