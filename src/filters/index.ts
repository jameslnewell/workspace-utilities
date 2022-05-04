import { Workspace } from "../Workspace";
import path from "path";
import micromatch from "micromatch";

interface WorkspaceFilter {
  (workspace: Workspace): boolean;
}

export function isPrivate(): WorkspaceFilter {
  return (workspace: Workspace) => workspace.private === true;
}

export function nameMatches(name: string): WorkspaceFilter {
  const isMatch = micromatch.matcher(name, {});
  return (workspace: Workspace) => isMatch(workspace.name);
}

export function directoryMatches(directory: string): WorkspaceFilter {
  const isMatch = micromatch.matcher(directory, {});
  return (workspace: Workspace) => isMatch(workspace.directory);
}

export function scriptExists(script: string): WorkspaceFilter {
  return (workspace: Workspace) => workspace.hasScript(script);
}

export interface HasChangedOptions {
  diff: Record<string, string>;
}

export function hasChanged({ diff }: HasChangedOptions): WorkspaceFilter {
  return (workspace: Workspace) =>
    Object.keys(diff).some((file) =>
      file.startsWith(`${workspace.directory}${path.sep}`)
    );
}

export function not(
  filter: (workspace: Workspace) => boolean
): WorkspaceFilter {
  return (workspace: Workspace) => !filter(workspace);
}

export function or(
  ...filters: Array<(workspace: Workspace) => boolean>
): WorkspaceFilter {
  return (workspace: Workspace) => filters.some((filter) => filter(workspace));
}

export function and(
  ...filters: Array<(workspace: Workspace) => boolean>
): WorkspaceFilter {
  return (workspace: Workspace) => filters.every((filter) => filter(workspace));
}

export function parse(filter: string) {}
