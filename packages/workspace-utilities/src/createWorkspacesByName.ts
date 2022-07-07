import { Workspace } from "./Workspace";

type WorkspacesByName = {[name: string]: Workspace};

export function createWorkspacesByName(workspaces: Workspace[]): WorkspacesByName {
  const workspacesByName: WorkspacesByName = {};
  for (const workspace of workspaces) {
    workspacesByName[workspace.name] = workspace
  }
  return workspacesByName;
}
