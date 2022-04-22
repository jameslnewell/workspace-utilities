import path from "path";
import { getDiff } from "./getDiff";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

export interface IncludeChangedOptions {
  project: Project;
}

export async function createIsWorkspaceChangedFilter({
  project,
}: IncludeChangedOptions): Promise<(workspace: Workspace) => boolean> {
  const changedFiles = (await getDiff({ root: project.root.directory })).keys();
  return (workspace) => {
    for (const changedFile of changedFiles) {
      if (changedFile.startsWith(`${workspace.directory}${path.sep}`)) {
        return true;
      }
    }
    return false;
  };
}
