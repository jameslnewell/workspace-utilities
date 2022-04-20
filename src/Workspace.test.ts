import { Manifest } from "./Manifest";
import { Workspace } from "./Workspace";

describe("Workspace", () => {
  describe(".dependencies()", () => {
    test("rerturns zero dependents when workspaces do not have any dependencies", () => {
      const workspaces = new Map<string, Workspace>();
      const manifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
      });
      const workspace = new Workspace(manifest, workspaces);
      expect(workspace.dependencies().size).toEqual(0);
    });

    test("rerturns zero dependencies when the current workspace does not depended on any other workspaces", () => {
      const workspaces = new Map<string, Workspace>();
      const manifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          express: "^4.17.0",
        },
      });
      const workspace = new Workspace(manifest, workspaces);
      workspaces.set("foo", workspace);
      expect(workspace.dependencies().size).toEqual(0);
    });

    test("rerturns zero dependencies when the current workspace depends on another workspace but the version is not in range", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "5.0.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      expect(fooWorkspace.dependencies().size).toEqual(0);
    });

    test("rerturns a dependency when the current workspace depends on another workspace and the version is in range", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "4.20.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      const dependencies = fooWorkspace.dependencies();
      expect(dependencies.size).toEqual(1);
      expect(Array.from(dependencies)).toEqual(
        expect.arrayContaining([barWorkspace])
      );
    });
  });

  describe(".dependents()", () => {
    test("rerturns zero dependents when workspaces do not have any dependencies", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "1.0.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      expect(barWorkspace.dependents().size).toEqual(0);
    });

    test("rerturns zero dependents when the current workspace is not depended on by another workspace", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          express: "^4.17.0",
        },
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "1.0.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      expect(barWorkspace.dependents().size).toEqual(0);
    });

    test("rerturns zero dependents when the current workspace is depended on by another workspace but the version is not in range", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "5.0.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      expect(barWorkspace.dependents().size).toEqual(0);
    });

    test("rerturns a dependent when the current workspace is depended on by another workspace and the version is in range", () => {
      const workspaces = new Map<string, Workspace>();
      const fooManifest = new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barManifest = new Manifest("bar/package.json", {
        name: "bar",
        version: "4.20.0",
      });
      const fooWorkspace = new Workspace(fooManifest, workspaces);
      const barWorkspace = new Workspace(barManifest, workspaces);
      workspaces.set("foo", fooWorkspace);
      workspaces.set("bar", barWorkspace);
      const dependents = barWorkspace.dependents();
      expect(dependents.size).toEqual(1);
      expect(Array.from(dependents)).toEqual(
        expect.arrayContaining([fooWorkspace])
      );
    });
  });
});
