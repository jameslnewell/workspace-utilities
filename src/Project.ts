import path from "path";
import glob from "fast-glob";
import { Workspace } from "./Workspace";
import { Manifest } from "./Manifest";

export class Project {
  #root: Workspace;
  #workspaces: Set<Workspace>;
  #workspacesByName: Map<string, Workspace>;

  constructor(root: Workspace, workspaces: Set<Workspace>) {
    this.#root = root;
    this.#workspaces = workspaces;
    this.#workspacesByName = new Map(
      Array.from(workspaces).map((workspace) => [workspace.name, workspace])
    );
  }

  get root(): Workspace {
    return this.#root;
  }

  get workspaces(): Set<Workspace> {
    return this.#workspaces;
  }

  getWorkspaceByName(name: string): Workspace | undefined {
    return this.#workspacesByName.get(name);
  }

  static async read(directory: string): Promise<Project> {
    const workspaces = new Set<Workspace>();
    const rootManifest = await Manifest.read(
      path.join(directory, "package.json")
    );
    const rootWorkspace = new Workspace(rootManifest);
    workspaces.add(rootWorkspace);

    const files = await glob(
      rootManifest.workspaces.map((pattern) => `${pattern}/package.json`),
      { cwd: directory }
    );

    await Promise.all(
      files.map(async (file) => {
        const childManifest = await Manifest.read(file);
        const childWorkspace = new Workspace(childManifest);
        workspaces.add(childWorkspace);
      })
    );

    return new Project(rootWorkspace, workspaces);
  }
}
