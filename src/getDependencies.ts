import debug from "debug";
import { satisfies } from "semver";
import { ManifestDependencyKey } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

const log = debug("@jameslnewell/workspace-utilities:get-dependents");

export interface GetDependenciesOptions {
  project: Project;
  keys?: ManifestDependencyKey[];
  recursive?: boolean;
}

export function getDependencies(
  workspace: Workspace,
  { project, keys, recursive }: GetDependenciesOptions
): Workspace[] {
  const dependencies: Workspace[] = [];

  const deps = workspace.manifest.dependencies(keys);
  for (const name of deps.keys()) {
    const range = deps.get(name);
    const dependencyWorkspace = project.getWorkspaceByName(name);
    if (range && dependencyWorkspace) {
      const satisfied = satisfies(dependencyWorkspace.version, range);
      log(
        `${dependencyWorkspace.name}@${dependencyWorkspace.version} ${
          satisfied ? "satisfies" : "does not satisfy"
        } ${workspace.name}'s requirement for ${
          dependencyWorkspace.name
        }@${range}`
      );
      if (satisfied) {
        dependencies.push(dependencyWorkspace);
        if (recursive) {
          getDependencies(dependencyWorkspace, {
            project,
            keys,
            recursive,
          }).forEach((w) => dependencies.push(w));
        }
      }
    }
  }

  // remove any duplicates
  return Array.from(new Set(dependencies));
}
