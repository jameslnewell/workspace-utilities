import path from "path";
import glob from "fast-glob";
import { Workspace } from "./Workspace";
import { Manifest } from "./Manifest";

export class Project {
  #root: Workspace;
  #workspaces: Set<Workspace>;

  constructor(root: Workspace, workspaces: Set<Workspace>) {
    this.#root = root;
    this.#workspaces = workspaces;
  }

  get root(): Workspace {
    return this.#root;
  }

  get workspaces(): Set<Workspace> {
    return this.#workspaces;
  }

  static async read(directory: string): Promise<Project> {
    const workspaces = new Set<Workspace>();
    const workspacesByName = new Map<string, Workspace>();
    const rootManifest = await Manifest.read(
      path.join(directory, "package.json")
    );
    const rootWorkspace = new Workspace(rootManifest, workspacesByName);
    workspaces.add(rootWorkspace);
    workspacesByName.set(rootWorkspace.name, rootWorkspace);

    const files = await glob(
      rootManifest.workspaces.map((pattern) => `${pattern}/package.json`),
      { cwd: directory }
    );

    await Promise.all(
      files.map(async (file) => {
        const childManifest = await Manifest.read(file);
        const childWorkspace = new Workspace(childManifest, workspacesByName);
        workspaces.add(childWorkspace);
        workspacesByName.set(childWorkspace.name, childWorkspace);
      })
    );

    return new Project(rootWorkspace, workspaces);
  }
}
