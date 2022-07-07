import { Workspace } from "./Workspace";


export const since = "ref";

export const rootDirectory = "";
export const rootFile = "package.json";
export const rootName = "root";
export const rootVersion = "1.0.0";
export const rootJSON = {
  name: rootName,
  version: rootVersion,
  workspaces: ["packages/*"],
};
export const rootWorkspace = new Workspace(rootFile, rootJSON);

export const fooDirectory = "packages/foo";
export const fooFile = `${fooDirectory}/package.json`;
export const fooName = "foo";
export const fooVersion = "1.2.3";
export const fooJSON = {
  name: fooName,
  version: fooVersion,
};
export const fooWorkspace = new Workspace(fooDirectory, fooJSON);
export const fooDiff = {
  [fooFile]: "M",
};

export const barDirectory = "packages/bar";
export const barFile = `${barDirectory}/package.json`;
export const barName = "bar";
export const barVersion = "4.5.6";
export const barJSON = {
  name: barName,
  version: barVersion,
};
export const barWorkspace = new Workspace(barDirectory, barJSON);
export const barDiff = {
  [barFile]: "M",
};

export const barBarDirectory = "packages/barbar";
export const barBarFile = `${barBarDirectory}/package.json`;
export const barBarName = "barbar";
