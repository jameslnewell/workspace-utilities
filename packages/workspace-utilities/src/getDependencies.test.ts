import { barBarFile, barBarName, barFile, barJSON, barWorkspace, fooFile, fooJSON, fooWorkspace, rootWorkspace } from "./fixtures";
import { getDependencies } from "./getDependencies";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe(".getDependencies()", () => {
  test("returns zero dependencies when workspaces do not have any dependencies", () => {
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependencies = getDependencies(rootWorkspace, {project});
    expect(dependencies).toHaveLength(0);
  });

  test("rerturns zero dependencies when a workspace does not depended on any other workspaces", () => {
    const fooWorkspace = new Workspace(
      fooFile, {
        ...fooJSON,
        dependencies: {
          express: "^4.17.0",
        },
      }
    );
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependencies = getDependencies(fooWorkspace, {project});
    expect(dependencies).toHaveLength(0);
  });

  test("returns zero dependencies when a workspace depends on another workspace but the version is not in range", () => {
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
        version: "5.2.1",
      }
    );
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependencies = getDependencies(fooWorkspace, {project});
    expect(dependencies).toHaveLength(0);
  });

  test("returns dependencies when a workspace depends on another workspace and the version is in range", () => {
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
        version: "4.20.1",
      }
    );

    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace])
    const dependencies = getDependencies(fooWorkspace, {project});
    expect(dependencies).toContainEqual(barWorkspace);
    expect(dependencies.length).toEqual(1);
  });

  test("returns recursive dependencies when a workspace depends on another workspace and recursive flag is set", () => {
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
        version: "4.20.1",
        dependencies: {
          barbar: "^1.2.0",
        },
      }
    );
    const barbarWorkspace = new Workspace(
      barBarFile, {
        name: barBarName,
        version: "1.3.0",
      }
    );

    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace, barbarWorkspace])
    const dependencies = getDependencies(fooWorkspace, {
      project,
      recursive: true,
    });
    expect(dependencies).toContainEqual(barWorkspace);
    expect(dependencies).toContainEqual(barbarWorkspace);
    expect(dependencies.length).toEqual(2);
  });
});
