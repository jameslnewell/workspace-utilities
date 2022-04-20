import { excludeRoot } from "./filter";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe("excludeRoot()", () => {
  test("the root workspace is excluded", () => {
    const workspaces = new Set<Workspace>();
    const workspacesByName = new Map<string, Workspace>();
    const rootManifest = new Manifest("root/package.json", {
      name: "root",
      version: "1.0.0",
    });
    const rootWorkspace = new Workspace(rootManifest, workspacesByName);
    const otherManifest = new Manifest("other/package.json", {
      name: "other",
      version: "1.0.0",
    });
    const otherWorkspace = new Workspace(otherManifest, workspacesByName);
    workspaces.add(rootWorkspace);
    workspacesByName.set(rootWorkspace.name, rootWorkspace);
    workspaces.add(otherWorkspace);
    workspacesByName.set(otherWorkspace.name, otherWorkspace);
    const project = new Project(rootWorkspace, workspaces);

    expect(excludeRoot(workspaces, { project })).not.toContain(rootWorkspace);
  });
});
