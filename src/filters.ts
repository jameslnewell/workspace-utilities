import { Workspace } from "./Workspace";
import path from "path";
import micromatch from "micromatch";

export function isPrivate() {
  return (workspace: Workspace) => workspace.private === true;
}

export function nameMatches(name: string) {
  const isMatch = micromatch.matcher(name, {});
  return (workspace: Workspace) => isMatch(workspace.name);
}

export function directoryMatches(directory: string) {
  const isMatch = micromatch.matcher(directory, {});
  return (workspace: Workspace) => isMatch(workspace.directory);
}

export function hasScript(script: string) {
  return (workspace: Workspace) => workspace.hasScript(script);
}

export interface HasChangedOptions {
  diff: Record<string, string>;
}

export function hasChanged({ diff }: HasChangedOptions) {
  return (workspace: Workspace) =>
    Object.keys(diff).find((file) =>
      file.startsWith(`${workspace.directory}${path.sep}`)
    );
}

export function not(filter: (workspace: Workspace) => boolean) {
  return (workspace: Workspace) => !filter(workspace);
}

export function or(
  filter1: (workspace: Workspace) => boolean,
  filter2: (workspace: Workspace) => boolean
) {
  return (workspace: Workspace) => filter1(workspace) || filter2(workspace);
}

export function and(
  filter1: (workspace: Workspace) => boolean,
  filter2: (workspace: Workspace) => boolean
) {
  return (workspace: Workspace) => filter1(workspace) && filter2(workspace);
}

export function parse(filter: string) {}
