import path from "path";
import glob from "fast-glob";
import { Workspace } from "./Workspace";
import { Manifest } from "./Manifest";

export class Project {
  #root: Workspace;
  #workspaces: Array<Workspace>;

  constructor(root: Workspace, workspaces: Array<Workspace>) {
    this.#root = root;
    this.#workspaces = workspaces;
    // TODO: error if multiple packages exist with the same name
  }

  get root(): Workspace {
    return this.#root;
  }

  get workspaces(): Workspace[] {
    return this.#workspaces;
  }

  static async fromDirectory(directory: string): Promise<Project> {
    const workspacesByName: Record<string, Workspace> = {};
    const rootManifest = await Manifest.fromFile(
      path.join(directory, "package.json")
    );
    const rootWorkspace = new Workspace(rootManifest, workspacesByName);
    workspacesByName[rootWorkspace.name] = rootWorkspace;

    const files = await glob(
      rootManifest.workspaces.map((pattern) => `${pattern}/package.json`),
      { cwd: directory, absolute: true }
    );

    const workspaces = await Promise.all(
      files.map(async (file) => {
        const childManifest = await Manifest.fromFile(file);
        const childWorkspace = new Workspace(childManifest, workspacesByName);
        workspacesByName[childWorkspace.name] = childWorkspace;
        return childWorkspace;
      })
    );

    return new Project(rootWorkspace, workspaces);
  }
}
