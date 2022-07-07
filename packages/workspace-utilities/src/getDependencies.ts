import { DependencyType } from "./DependencyType";
import { Workspace } from "./Workspace";
import { satisfies } from "semver";
import { debug } from "./debug";
import { Project } from "./Project";
import { createWorkspacesByName } from "./createWorkspacesByName";

const logger = debug.extend('getDependencies')

export interface GetDependenciesOptions {
  project: Project
  types?: DependencyType[];
  recursive?: boolean;
}

/**
 * Get a list of packages which are dependend on by the specified workspace
 * @param workspace 
 * @param options 
 * @returns A list of dependents
 */
export function getDependencies(workspace: Workspace, {project, types, recursive}: GetDependenciesOptions): Workspace[] {
  const workspacesByName = createWorkspacesByName([project.root, ...project.children])
  
  // using a set to avoid duplicates
  const workspacesThatThisWorkspaceDependsOn = new Set<Workspace>();

  // TODO: check for circular references
  const dependencies = workspace.dependencies(types);
  for (const [dependencyName, dependencyRange] of dependencies.entries()) {
    const dependencyWorkspace = workspacesByName[dependencyName];
    if (dependencyRange && dependencyWorkspace) {
      const satisfied = satisfies(
        dependencyWorkspace.version,
        dependencyRange
      );
      logger(
        `${dependencyWorkspace.name}@${dependencyWorkspace.version} ${
          satisfied ? "satisfies" : "does not satisfy"
        } ${workspace.name}'s requirement for ${
          dependencyWorkspace.name
        }@${dependencyRange}`
      );
      if (satisfied) {
        workspacesThatThisWorkspaceDependsOn.add(dependencyWorkspace);
        if (recursive) {
          getDependencies(dependencyWorkspace, {
              project,
              types,
              recursive,
            })
            .forEach((w) => workspacesThatThisWorkspaceDependsOn.add(w));
        }
      }
    }
  }


  return Array.from(workspacesThatThisWorkspaceDependsOn);
}
