import { Manifest } from "./Manifest";
import { Workspace } from "./Workspace";

export const rootDirectory = "";

export const since = "ref";

const workspacesByName: Record<string, Workspace> = {};

export const rootFile = "package.json";
export const rootName = "root";
export const rootJSON = {
  name: rootName,
  version: "1.0.0",
  workspaces: ["packages/*"],
};
export const rootManifest = new Manifest(rootFile, rootJSON);
export const rootWorkspace = new Workspace(rootManifest, workspacesByName);

export const fooFile = "packages/foo/package.json";
export const fooName = "foo";
export const fooJSON = {
  name: fooName,
  version: "1.2.3",
};
export const fooManifest = new Manifest(fooFile, fooJSON);
export const fooWorkspace = new Workspace(fooManifest, workspacesByName);
export const fooDiff = {
  [fooFile]: "M",
};

export const barFile = "packages/bar/package.json";
export const barName = "bar";
export const barJSON = {
  name: barName,
  version: "4.5.6",
};
export const barManifest = new Manifest(barFile, barJSON);
export const barWorkspace = new Workspace(barManifest, workspacesByName);
export const barDiff = {
  [barFile]: "M",
};

export const barBarFile = "packages/barbar/package.json";
export const barBarName = "barbar";

workspacesByName[rootName] = rootWorkspace;
workspacesByName[fooName] = fooWorkspace;
workspacesByName[barName] = barWorkspace;
