import path from 'path'
import glob from "fast-glob";
import { Workspace } from "./Workspace";

function getWorkspacePatterns(workspace: Workspace): string[] {
  // TODO: handle pnpm
  return (
    (Array.isArray(workspace.json.workspaces)
      ? workspace.json.workspaces
      : Array.isArray(workspace.json.workspaces?.packages)
      ? workspace.json.workspaces?.packages
      : []) ?? []
  );
}

export class Project {
  #root: Workspace;
  #children: Workspace[]

  constructor(root: Workspace, children: Workspace[]) {
    this.#root = root;
    this.#children = children;
    // TODO: error if multiple packages exist with the same name
  }

  get root(): Workspace {
    return this.#root;
  }

  get children(): Workspace[] {
    return this.#children;
  }

  static async fromDirectory(directory: string): Promise<Project> {
    const rootWorkspace = await Workspace.fromDirectory(directory);

    const patterns = getWorkspacePatterns(rootWorkspace)

    const files = await glob(
      patterns.map((pattern) => `${pattern}/package.json`),
      { cwd: directory, absolute: true }
    );

    const workspaces = await Promise.all(
      files.map(async (file) => {
        const childWorkspace = await Workspace.fromDirectory(path.dirname(file));
        return childWorkspace;
      })
    );

    return new Project(rootWorkspace, workspaces);
  }
}
