import { Workspace } from "./Workspace";
import path from "path";
import micromatch from "micromatch";

interface WorkspaceFilter {
  (workspace: Workspace): boolean;
}

/**
 * Creates a filter which excludes workspaces which do not exist at the specified directory
 * @param directory The exact directory or a glob to match
 * @returns A filter function
 */
 export function directory(directory: string): WorkspaceFilter {
  const isMatch = micromatch.matcher(directory, {});
  return (workspace: Workspace) => isMatch(workspace.directory);
}

/**
 * Creates a filter which excludes workspaces which do not have the "private" property set to `true` in package.json
 * @returns A filter function
 */
function createPrivateFilter(): WorkspaceFilter {
  return (workspace: Workspace) => workspace.private === true;
}
export { createPrivateFilter as private}

/**
 * Creates a filter which excludes workspaces which are not named with the specified name
 * @param name The exact name or a glob to match
 * @returns A filter function
 */
export function name(name: string): WorkspaceFilter {
  const isMatch = micromatch.matcher(name, {});
  return (workspace: Workspace) => isMatch(workspace.name);
}

/**
 * Creates a filter which excludes workspaces which do not have a script with the specified name
 * @param script The exact script name or a glob to match
 * @returns A filter function
 */
export function script(script: string): WorkspaceFilter {
  const isMatch = micromatch.matcher(script, {});
  return (workspace: Workspace) => Object.keys(workspace.scripts).some(script => isMatch(script))
}

/**
 * Creates a filter which excludes workspaces which do not have any created/modified/deleted files in the specified diff
 * @param diff The git diff
 * @returns A filter function
 */
export function changed(diff: Record<string, string>): WorkspaceFilter {
  return (workspace: Workspace) =>
    Object.keys(diff).some((file) =>
      file.startsWith(`${workspace.directory}${path.sep}`)
    );
}

/**
 * Creates a filter which excludes any workspaces that match the specified filter
 * @param filter The filter
 * @returns A filter function
 */
export function not(
  filter: (workspace: Workspace) => boolean
): WorkspaceFilter {
  return (workspace: Workspace) => !filter(workspace);
}

/**
 * Creates a filter which excludes any workspaces that do not match at least one of the specified filters
 * @param filter The filter
 * @returns A filter function
 */
export function or(
  ...filters: Array<(workspace: Workspace) => boolean>
): WorkspaceFilter {
  return (workspace: Workspace) => filters.some((filter) => filter(workspace));
}

/**
 * Creates a filter which excludes any workspaces that do not match all of the specified filters
 * @param filter The filter
 * @returns A filter function
 */
export function and(
  ...filters: Array<(workspace: Workspace) => boolean>
): WorkspaceFilter {
  return (workspace: Workspace) => filters.every((filter) => filter(workspace));
}
