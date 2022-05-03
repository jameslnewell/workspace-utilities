import path from "path";
import { Manifest } from "./Manifest";
import { Workspace } from "./Workspace";

describe("Workspace", () => {
  const file = "packages/foo/package.json";
  const json = { name: "foo", version: "1.0.0" };
  const manifest = new Manifest(file, json);
  const workspace = new Workspace(manifest, {});

  describe(".name", () => {
    test("returns the same name as the manifest", () => {
      expect(workspace.name).toEqual(manifest.name);
    });
  });

  describe(".version", () => {
    test("returns the same version as the the manifest", () => {
      expect(workspace.version).toEqual(manifest.version);
    });
  });

  describe(".directory", () => {
    test("returns the parent directory of the manifest file", () => {
      expect(workspace.directory).toEqual(path.dirname(manifest.file));
    });
  });

  describe(".hasScript()", () => {
    test("returns false when the manifest does not contain scripts", () => {
      expect(workspace.hasScript("test")).toBeFalsy();
    });

    test("returns true when the manifest contains scripts", () => {
      const manifest = new Manifest(file, {
        ...json,
        scripts: { test: "jest" },
      });
      const workspace = new Workspace(manifest, {});
      expect(workspace.hasScript("test")).toBeTruthy();
    });
  });

  const workspacesByName: Record<string, Workspace> = {};

  const rootFile = "package.json";
  const rootName = "root";
  const rootJSON = {
    name: rootName,
    version: "1.0.0",
    workspaces: ["packages/*"],
  };
  const rootManifest = new Manifest(rootFile, rootJSON);
  const rootWorkspace = new Workspace(rootManifest, workspacesByName);

  const fooFile = "packages/foo/package.json";
  const fooName = "foo";
  const fooJSON = {
    name: fooName,
    version: "1.2.3",
  };
  const fooManifest = new Manifest(fooFile, fooJSON);
  const fooWorkspace = new Workspace(fooManifest, workspacesByName);

  const barFile = "packages/bar/package.json";
  const barName = "bar";
  const barJSON = {
    name: barName,
    version: "4.5.6",
  };
  const barManifest = new Manifest(barFile, barJSON);
  const barWorkspace = new Workspace(barManifest, workspacesByName);

  const barBarFile = "packages/barbar/package.json";
  const barBarName = "barbar";

  workspacesByName[rootName] = rootWorkspace;
  workspacesByName[fooName] = fooWorkspace;
  workspacesByName[barName] = barWorkspace;

  describe(".getDependencies()", () => {
    test("returns zero dependencies when workspaces do not have any dependencies", () => {
      const dependencies = rootWorkspace.getDependencies();
      expect(dependencies).toHaveLength(0);
    });

    test("rerturns zero dependencies when a workspace does not depended on any other workspaces", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            express: "^4.17.0",
          },
        }),
        workspacesByName
      );
      workspacesByName[rootName] = rootWorkspace;
      workspacesByName[fooName] = fooWorkspace;

      const dependencies = fooWorkspace.getDependencies();
      expect(dependencies).toHaveLength(0);
    });

    test("returns zero dependencies when a workspace depends on another workspace but the version is not in range", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "5.2.1",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;

      const dependencies = fooWorkspace.getDependencies();
      expect(dependencies).toHaveLength(0);
    });

    test("returns dependencies when a workspace depends on another workspace and the version is in range", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.1",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;

      const dependencies = fooWorkspace.getDependencies();
      expect(dependencies).toContainEqual(barWorkspace);
      expect(dependencies.length).toEqual(1);
    });

    test("returns recursive dependencies when a workspace depends on another workspace and recursive flag is set", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.1",
          dependencies: {
            barbar: "^1.2.0",
          },
        }),
        workspacesByName
      );
      const barbarWorkspace = new Workspace(
        new Manifest(barBarFile, {
          name: barBarName,
          version: "1.3.0",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;
      workspacesByName[barBarName] = barbarWorkspace;

      const dependencies = fooWorkspace.getDependencies({
        recursive: true,
      });
      expect(dependencies).toContainEqual(barWorkspace);
      expect(dependencies).toContainEqual(barbarWorkspace);
      expect(dependencies.length).toEqual(2);
    });
  });

  describe(".getDependents()", () => {
    test("returns zero dependents when workspaces do not have any dependencies", () => {
      const dependents = barWorkspace.getDependents();
      expect(dependents).toHaveLength(0);
    });

    test("returns zero dependents when a workspace is not depended on by another workspace", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            express: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;

      const dependents = barWorkspace.getDependents();
      expect(dependents).toHaveLength(0);
    });

    test("returns zero dependents when a workspace is depended on by another workspace but the version is not in range", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "5.0.0",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;

      const dependents = barWorkspace.getDependents();
      expect(dependents).toHaveLength(0);
    });

    test("returns a dependent when a workspace is depended on by another workspace and the version is in range", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.0",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;

      const dependents = barWorkspace.getDependents();
      expect(dependents).toContainEqual(fooWorkspace);
      expect(dependents).toHaveLength(1);
    });

    test("returns dependents recursively when a workspace depends on another workspace", () => {
      const workspacesByName: Record<string, Workspace> = {};
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        workspacesByName
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.0",
          dependencies: {
            barbar: "^1.2.0",
          },
        }),
        workspacesByName
      );
      const barbarWorkspace = new Workspace(
        new Manifest(barBarFile, {
          name: "barbar",
          version: "1.3.0",
        }),
        workspacesByName
      );
      workspacesByName[fooName] = fooWorkspace;
      workspacesByName[barName] = barWorkspace;
      workspacesByName[barBarName] = barbarWorkspace;

      const dependents = barbarWorkspace.getDependents({
        recursive: true,
      });
      expect(dependents).toContainEqual(barWorkspace);
      expect(dependents).toContainEqual(fooWorkspace);
      expect(dependents).toHaveLength(2);
    });
  });
});
