import debug from "debug";
import path from "path";
import { satisfies } from "semver";
import { DependencyType } from "./DependencyType";
import { Manifest } from "./Manifest";

const logger = debug("@jameslnewell/workspace-utilities:Workspace");
const getDependenciesLogger = logger.extend("getDependencies");
const getDependentsLogger = logger.extend("getDependents");

export interface GetDependentsOptions {
  types?: DependencyType[];
  recursive?: boolean;
}

export interface GetDependenciesOptions {
  types?: DependencyType[];
  recursive?: boolean;
}

export class Workspace {
  #manifest: Manifest;
  #workspacesByName: Record<string, Workspace>;

  constructor(manifest: Manifest, workspacesByName: Record<string, Workspace>) {
    this.#manifest = manifest;
    this.#workspacesByName = workspacesByName;
  }

  get directory(): string {
    return path.dirname(this.#manifest.file);
  }

  get manifest(): Manifest {
    return this.#manifest;
  }

  get private(): boolean {
    return this.#manifest.private;
  }

  get name(): string {
    return this.#manifest.name;
  }

  get version(): string {
    return this.#manifest.version;
  }

  hasScript(name: string): boolean {
    return Boolean(this.#manifest.scripts[name]);
  }

  getDependents({ types, recursive }: GetDependentsOptions = {}): Workspace[] {
    // using a set to avoid duplicates
    const workspacesThatDependOnThisWorkspace = new Set<Workspace>();

    // TODO: check for circular references
    for (const dependentWorkspace of Object.values(this.#workspacesByName)) {
      // TODO: ignore self
      const range = dependentWorkspace.#manifest
        .getDependencies(types)
        .get(this.name);
      if (range) {
        const satisfied = satisfies(this.version, range);
        getDependentsLogger(
          `${this.name}@${this.version} ${
            satisfied ? "satisfies" : "does not satisfy"
          } ${dependentWorkspace.name}'s requirement for ${this.name}@${range}`
        );
        if (satisfied) {
          workspacesThatDependOnThisWorkspace.add(dependentWorkspace);
          if (recursive) {
            dependentWorkspace
              .getDependents({
                types,
                recursive,
              })
              .forEach((w) => workspacesThatDependOnThisWorkspace.add(w));
          }
        }
      }
    }

    return Array.from(workspacesThatDependOnThisWorkspace);
  }

  getDependencies({
    types,
    recursive,
  }: GetDependenciesOptions = {}): Workspace[] {
    // using a set to avoid duplicates
    const workspacesThatThisWorkspaceDependsOn = new Set<Workspace>();

    // TODO: check for circular references
    const dependencies = this.#manifest.getDependencies(types);
    for (const [dependencyName, dependencyRange] of dependencies.entries()) {
      const dependencyWorkspace = this.#workspacesByName[dependencyName];
      if (dependencyRange && dependencyWorkspace) {
        const satisfied = satisfies(
          dependencyWorkspace.version,
          dependencyRange
        );
        getDependenciesLogger(
          `${dependencyWorkspace.name}@${dependencyWorkspace.version} ${
            satisfied ? "satisfies" : "does not satisfy"
          } ${this.name}'s requirement for ${
            dependencyWorkspace.name
          }@${dependencyRange}`
        );
        if (satisfied) {
          workspacesThatThisWorkspaceDependsOn.add(dependencyWorkspace);
          if (recursive) {
            dependencyWorkspace
              .getDependencies({
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
}
