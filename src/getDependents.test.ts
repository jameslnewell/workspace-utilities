import { getDependents } from "./getDependents";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe(".getDependents()", () => {
  test("rerturns zero dependents when workspaces do not have any dependencies", () => {
    const fooManifest = new Manifest("foo/package.json", {
      name: "foo",
      version: "1.0.0",
    });
    const barManifest = new Manifest("bar/package.json", {
      name: "bar",
      version: "1.0.0",
    });
    const fooWorkspace = new Workspace(fooManifest);
    const barWorkspace = new Workspace(barManifest);
    const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);
    expect(getDependents(barWorkspace, { project })).toHaveLength(0);
  });

  test("rerturns zero dependents when the current workspace is not depended on by another workspace", () => {
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
    const fooWorkspace = new Workspace(fooManifest);
    const barWorkspace = new Workspace(barManifest);
    const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);
    expect(getDependents(barWorkspace, { project })).toHaveLength(0);
  });

  test("rerturns zero dependents when the current workspace is depended on by another workspace but the version is not in range", () => {
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
    expect(getDependents(barWorkspace, { project })).toHaveLength(0);
  });

  test("rerturns a dependent when the current workspace is depended on by another workspace and the version is in range", () => {
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
    const dependents = getDependents(barWorkspace, { project });
    expect(dependents).toContain(fooWorkspace);
    expect(dependents).toHaveLength(1);
  });

  test.only("returns dependents recursively when the current workspace depends on another workspace", () => {
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
    const depedents = getDependents(barbarWorkspace, {
      project,
      recursive: true,
    });

    expect(depedents).toContain(barWorkspace);
    expect(depedents).toContain(fooWorkspace);
    expect(depedents).toHaveLength(2);
  });
});
