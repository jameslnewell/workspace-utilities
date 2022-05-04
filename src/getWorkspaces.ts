import path from "path";
import { isPrivate, not } from "./filters";
import { getDiff } from "./getDiff";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

export interface GetWorkspacesOptions {
  since?: string;
  excludeRoot?: boolean;
  excludePrivate?: boolean;
  includeDependents?: boolean | "recursive";
  includedependencies?: boolean | "recursive";
}

export async function getWorkspaces(
  project: Project,
  {
    since,
    excludeRoot = true,
    excludePrivate,
    includeDependents,
    includedependencies,
  }: GetWorkspacesOptions = {}
): Promise<Workspace[]> {
  let workspaces = project.workspaces;

  if (!excludeRoot) {
    workspaces.push(project.root);
  }

  if (excludePrivate) {
    workspaces = workspaces.filter(not(isPrivate()));
  }

  if (since) {
    const changedFiles = Object.keys(
      await getDiff(project.root.directory, { since })
    );
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

  if (includedependencies) {
    for (const workspace of workspaces) {
      const dependencyWorkspaces = workspace.getDependencies({
        recursive: includedependencies === "recursive",
      });
      for (const depedencyWorkspace of dependencyWorkspaces) {
        combined.add(depedencyWorkspace);
      }
    }
  }

  if (includeDependents) {
    for (const workspace of workspaces) {
      const depedentWorkspaces = workspace.getDependents({
        recursive: includeDependents === "recursive",
      });
      for (const depedentWorkspace of depedentWorkspaces) {
        combined.add(depedentWorkspace);
      }
    }
  }

  return Array.from(combined);
}
