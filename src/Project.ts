import path from "path";
import debug from "debug";
import glob from "fast-glob";
import { satisfies } from "semver";
import { DependencyKey, Workspace } from "./Workspace";

const logger = debug("@jameslnewell/workspace-utilities");
const getWorkspaceDependenciesLogger = logger.extend(
  "getWorkspaceDependencies"
);
const getWorkspaceDependentsLogger = logger.extend("getWorkspaceDependents");
export interface ProjectGetWorkspaceDependenciesOptions {
  keys?: DependencyKey[];
  recursive?: boolean;
}

export interface ProjectGetWorkspaceDependentsOptions {
  keys?: DependencyKey[];
  recursive?: boolean;
}

interface ProjectGetWorkspacesOptions {
  root?: boolean;
  diff?: Record<string, string>;
  dependencies?: boolean | "recursive";
  dependents?: boolean | "recursive";
}

export class Project {
  #root: Workspace;
  #workspaces: Array<Workspace>;
  #workspacesByName: Map<string, Workspace>;

  constructor(root: Workspace, workspaces: Array<Workspace>) {
    this.#root = root;
    this.#workspaces = workspaces;
    this.#workspacesByName = new Map(
      Array.from(workspaces).map((workspace) => [workspace.name, workspace])
    );
    // TODO: error if multiple packages exist with the same name
  }

  get root(): Workspace {
    return this.#root;
  }

  getWorkspaceDependencies(
    workspace: Workspace,
    { keys, recursive }: ProjectGetWorkspaceDependenciesOptions = {}
  ): Workspace[] {
    const dependencies: Workspace[] = [];

    const deps = workspace.dependencies(keys);
    for (const name of deps.keys()) {
      const range = deps.get(name);
      const dependencyWorkspace = this.getWorkspaceByName(name);
      if (range && dependencyWorkspace) {
        const satisfied = satisfies(dependencyWorkspace.version, range);
        getWorkspaceDependenciesLogger(
          `${dependencyWorkspace.name}@${dependencyWorkspace.version} ${
            satisfied ? "satisfies" : "does not satisfy"
          } ${workspace.name}'s requirement for ${
            dependencyWorkspace.name
          }@${range}`
        );
        if (satisfied) {
          dependencies.push(dependencyWorkspace);
          if (recursive) {
            this.getWorkspaceDependencies(dependencyWorkspace, {
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

  getWorkspaceDependents(
    workspace: Workspace,
    { keys, recursive }: ProjectGetWorkspaceDependentsOptions = {}
  ): Workspace[] {
    const dependents: Workspace[] = [];

    for (const dependentWorkspace of [this.#root, ...this.#workspaces]) {
      // TODO: ignore self
      const deps = dependentWorkspace.dependencies(keys);
      const range = deps.get(workspace.name);
      if (range) {
        const satisfied = satisfies(workspace.version, range);
        getWorkspaceDependentsLogger(
          `${workspace.name}@${workspace.version} ${
            satisfied ? "satisfies" : "does not satisfy"
          } ${dependentWorkspace.name}'s requirement for ${
            workspace.name
          }@${range}`
        );
        if (satisfied) {
          dependents.push(dependentWorkspace);
          if (recursive) {
            this.getWorkspaceDependents(dependentWorkspace, {
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

  getWorkspaces({
    root,
    diff,
    dependents,
    dependencies,
  }: ProjectGetWorkspacesOptions = {}): Workspace[] {
    let workspaces = this.#workspaces;

    if (root) {
      workspaces.push(this.#root);
    }

    if (diff) {
      const changedFiles = Object.keys(diff);
      workspaces = workspaces.filter((workspace) => {
        for (const changedFile of changedFiles) {
          if (changedFile.startsWith(`${workspace.directory}${path.sep}`)) {
            return true;
          }
        }
        return false;
      });
    }

    const combined = new Set(workspaces);

    if (dependencies) {
      for (const workspace of workspaces) {
        const dependencyWorkspaces = this.getWorkspaceDependencies(workspace, {
          recursive: dependencies === "recursive",
        });
        for (const depedencyWorkspace of dependencyWorkspaces) {
          combined.add(depedencyWorkspace);
        }
      }
    }

    if (dependents) {
      for (const workspace of workspaces) {
        const depedentWorkspaces = this.getWorkspaceDependents(workspace, {
          recursive: dependents === "recursive",
        });
        for (const depedentWorkspace of depedentWorkspaces) {
          combined.add(depedentWorkspace);
        }
      }
    }

    return Array.from(combined);
  }

  getWorkspaceByName(name: string): Workspace | undefined {
    return this.#workspacesByName.get(name);
  }

  static async fromFile(file: string): Promise<Project> {
    const rootWorkspace = await Workspace.fromFile(file);

    const files = await glob(
      rootWorkspace.workspaces.map((pattern) => `${pattern}/package.json`),
      { cwd: path.dirname(file), absolute: true }
    );

    const workspaces = await Promise.all(
      files.map(async (file) => {
        const childWorkspace = await Workspace.fromFile(file);
        return childWorkspace;
      })
    );

    return new Project(rootWorkspace, workspaces);
  }

  static async fromDirectory(directory: string): Promise<Project> {
    return Project.fromFile(path.join(directory, "package.json"));
  }
}
