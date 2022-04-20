import { excludeRoot, getDependencies, getDependents } from "./filter";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe("excludeRoot()", () => {
  test("the root workspace is excluded", () => {
    const rootManifest = new Manifest("root/package.json", {
      name: "root",
      version: "1.0.0",
    });
    const rootWorkspace = new Workspace(rootManifest);
    const otherManifest = new Manifest("other/package.json", {
      name: "other",
      version: "1.0.0",
    });
    const otherWorkspace = new Workspace(otherManifest);
    const project = new Project(
      rootWorkspace,
      new Set<Workspace>([rootWorkspace, otherWorkspace])
    );

    expect(excludeRoot(project.workspaces, { project })).not.toContain(
      rootWorkspace
    );
  });
});

describe("getDependencies()", () => {
  test("rerturns zero dependents when workspaces do not have any dependencies", () => {
    const manifest = new Manifest("foo/package.json", {
      name: "foo",
      version: "1.0.0",
    });
    const workspace = new Workspace(manifest);
    const project = new Project(workspace, new Set([workspace]));
    expect(getDependencies(workspace, { project }).size).toEqual(0);
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
    const project = new Project(workspace, new Set([workspace]));
    expect(getDependencies(workspace, { project }).size).toEqual(0);
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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );

    expect(getDependencies(fooWorkspace, { project }).size).toEqual(0);
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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );
    const dependencies = getDependencies(fooWorkspace, { project });
    expect(dependencies.size).toEqual(1);
    expect(Array.from(dependencies)).toEqual(
      expect.arrayContaining([barWorkspace])
    );
  });
});

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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );
    expect(getDependents(barWorkspace, { project }).size).toEqual(0);
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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );
    expect(getDependents(barWorkspace, { project }).size).toEqual(0);
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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );
    expect(getDependents(barWorkspace, { project }).size).toEqual(0);
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
    const project = new Project(
      fooWorkspace,
      new Set([fooWorkspace, barWorkspace])
    );
    const dependents = getDependents(barWorkspace, { project });
    expect(dependents.size).toEqual(1);
    expect(Array.from(dependents)).toEqual(
      expect.arrayContaining([fooWorkspace])
    );
  });
});
