import { barBarFile, barFile, barJSON, barWorkspace, fooFile, fooJSON, fooWorkspace, rootWorkspace } from "./fixtures";
import { getDependents } from "./getDependents";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe(".getDependents()", () => {
  test("returns zero dependents when workspaces do not have any dependencies", () => {
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependents = getDependents(barWorkspace, {project});
    expect(dependents).toHaveLength(0);
  });

  test("returns zero dependents when a workspace is not depended on by another workspace", () => {
    const fooWorkspace = new Workspace(
      fooFile, {
        ...fooJSON,
        dependencies: {
          express: "^4.17.0",
        },
      }
    );
    const barWorkspace = new Workspace(
      barFile, {
        ...barJSON,
      }
    );

    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependents = getDependents(barWorkspace, {project});
    expect(dependents).toHaveLength(0);
  });

  test("returns zero dependents when a workspace is depended on by another workspace but the version is not in range", () => {
    const fooWorkspace = new Workspace(
      fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      }
    );
    const barWorkspace = new Workspace(
      barFile, {
        ...barJSON,
        version: "5.0.0",
      }
    );
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependents = getDependents(barWorkspace, {project});
    expect(dependents).toHaveLength(0);
  });

  test("returns a dependent when a workspace is depended on by another workspace and the version is in range", () => {
    const fooWorkspace = new Workspace(
      fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      }
    );
    const barWorkspace = new Workspace(
      barFile, {
        ...barJSON,
        version: "4.20.0",
      }
    );
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependents = getDependents(barWorkspace, {project});
    expect(dependents).toContainEqual(fooWorkspace);
    expect(dependents).toHaveLength(1);
  });

  test("returns dependents recursively when a workspace depends on another workspace", () => {
    const fooWorkspace = new Workspace(
      fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      }
    );
    const barWorkspace = new Workspace(
      barFile, {
        ...barJSON,
        version: "4.20.0",
        dependencies: {
          barbar: "^1.2.0",
        },
      }
    );
    const barbarWorkspace = new Workspace(
      barBarFile, {
        name: "barbar",
        version: "1.3.0",
      }
    );
      
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace, barbarWorkspace])
    const dependents = getDependents(barbarWorkspace, {
      project,
      recursive: true,
    });
    expect(dependents).toContainEqual(barWorkspace);
    expect(dependents).toContainEqual(fooWorkspace);
    expect(dependents).toHaveLength(2);
  });
});
