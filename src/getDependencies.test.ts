import { getDependencies } from "./getDependencies";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe("getDependencies()", () => {
  test("rerturns zero dependencies when workspaces do not have any dependencies", () => {
    const manifest = new Manifest("foo/package.json", {
      name: "foo",
      version: "1.0.0",
    });
    const workspace = new Workspace(manifest);
    const project = new Project(workspace, [workspace]);
    expect(getDependencies(workspace, { project })).toHaveLength(0);
  });

  test("rerturns zero dependencies when the current workspace does not depended on any other workspaces", () => {
    const manifest = new Manifest("foo/package.json", {
      name: "foo",
      version: "1.0.0",
      dependencies: {
        express: "^4.17.0",
      },
    });
    const workspace = new Workspace(manifest);
    const project = new Project(workspace, [workspace]);
    expect(getDependencies(workspace, { project })).toHaveLength(0);
  });

  test("rerturns zero dependencies when the current workspace depends on another workspace but the version is not in range", () => {
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
    const fooWorkspace = new Workspace(fooManifest);
    const barWorkspace = new Workspace(barManifest);
    const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);

    expect(getDependencies(fooWorkspace, { project })).toHaveLength(0);
  });

  test("rerturns a dependency when the current workspace depends on another workspace and the version is in range", () => {
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
    const fooWorkspace = new Workspace(fooManifest);
    const barWorkspace = new Workspace(barManifest);
    const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);
    const dependencies = getDependencies(fooWorkspace, { project });
    expect(dependencies).toContain(barWorkspace);
    expect(dependencies.length).toEqual(1);
  });

  test("returns dependencies recursively when the current workspace depends on another workspace", () => {
    const fooWorkspace = new Workspace(
      new Manifest("foo/package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          bar: "^4.17.0",
        },
      })
    );
    const barWorkspace = new Workspace(
      new Manifest("bar/package.json", {
        name: "bar",
        version: "4.20.0",
        dependencies: {
          barbar: "^1.2.0",
        },
      })
    );
    const barbarWorkspace = new Workspace(
      new Manifest("barbar/package.json", {
        name: "barbar",
        version: "1.3.0",
      })
    );

    const project = new Project(fooWorkspace, [barWorkspace, barbarWorkspace]);
    const dependencies = getDependencies(fooWorkspace, {
      project,
      recursive: true,
    });

    expect(dependencies).toContain(barWorkspace);
    expect(dependencies).toContain(barbarWorkspace);
    expect(dependencies.length).toEqual(2);
  });
});
