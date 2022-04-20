import path from "path";
import { satisfies } from "semver";
import { Manifest, ManifestDependencyKey } from "./Manifest";

export class Workspace {
  #manifest: Manifest;
  #workspacesByName: Map<string, Workspace>;

  constructor(manifest: Manifest, workspacesByName: Map<string, Workspace>) {
    this.#manifest = manifest;
    this.#workspacesByName = workspacesByName;
  }

  get directory(): string {
    return path.dirname(this.#manifest.file);
  }

  get manifest(): Manifest {
    return this.#manifest;
  }

  get name(): string {
    return this.#manifest.name;
  }

  get version(): string {
    return this.#manifest.version;
  }

  // TODO: support recursive
  dependencies(keys?: ManifestDependencyKey[]): Set<Workspace> {
    const dependencies = new Set<Workspace>();

    const deps = this.manifest.dependencies(keys);
    for (const name of deps.keys()) {
      const range = deps.get(name);
      const workspace = this.#workspacesByName.get(name);
      if (range && workspace && satisfies(workspace.manifest.version, range)) {
        dependencies.add(workspace);
      }
    }

    return dependencies;
  }

  // TODO: support recursive
  dependents(keys?: ManifestDependencyKey[]): Set<Workspace> {
    const dependents = new Set<Workspace>();

    for (const workspace of this.#workspacesByName.values()) {
      const deps = workspace.manifest.dependencies(keys);
      const range = deps.get(this.manifest.name);
      if (range && satisfies(this.manifest.version, range)) {
        dependents.add(workspace);
      }
    }

    return dependents;
  }
}
