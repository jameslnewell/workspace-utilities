import path from "path";
import glob from "fast-glob";
import { Workspace } from "./Workspace";
import { Manifest } from "./Manifest";

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

  get workspaces(): Array<Workspace> {
    return this.#workspaces;
  }

  getWorkspaceByName(name: string): Workspace | undefined {
    return this.#workspacesByName.get(name);
  }

  static async read(directory: string): Promise<Project> {
    const workspaces: Array<Workspace> = [];

    const rootWorkspace = new Workspace(
      await Manifest.read(path.join(directory, "package.json"))
    );

    const files = await glob(
      rootWorkspace.manifest.workspaces.map(
        (pattern) => `${pattern}/package.json`
      ),
      { cwd: directory, absolute: true }
    );

    await Promise.all(
      files.map(async (file) => {
        const childWorkspace = new Workspace(await Manifest.read(file));
        workspaces.push(childWorkspace);
      })
    );

    return new Project(rootWorkspace, workspaces);
  }
}
