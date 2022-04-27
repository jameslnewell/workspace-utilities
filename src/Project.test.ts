import createMockFilesystem from "mock-fs";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

const rootFile = "package.json";
const rootJSON = {
  name: "root",
  version: "1.0.0",
  workspaces: ["packages/*"],
};
const rootWorkspace = new Workspace(rootFile, rootJSON);

const fooFile = "packages/foo/package.json";
const fooJSON = {
  name: "foo",
  version: "1.2.3",
};
const fooWorkspace = new Workspace(fooFile, fooJSON);

const barFile = "packages/bar/package.json";
const barJSON = {
  name: "bar",
  version: "4.5.6",
};
const barWorkspace = new Workspace(barFile, barJSON);

const barBarFile = "barbar/package.json";

describe("Project", () => {
  describe(".fromFile()", () => {
    beforeEach(() =>
      createMockFilesystem({
        [rootFile]: JSON.stringify(rootJSON),
        [fooFile]: JSON.stringify(fooJSON),
        [barFile]: JSON.stringify(barJSON),
      })
    );

    afterEach(() => createMockFilesystem.restore());

    describe(".root", () => {
      test("is the root workspace", async () => {
        const project = await Project.fromFile(rootFile);
        expect(project.root.name).toEqual("root");
      });
    });

    describe(".getWorkspaces()", () => {
      test("does not include the root workspace", async () => {
        const project = await Project.fromFile(rootFile);
        const workspaces = project.getWorkspaces();
        expect(workspaces).not.toContainEqual(
          expect.objectContaining({
            name: rootJSON.name,
          })
        );
      });

      test("includes other workspaces", async () => {
        const project = await Project.fromFile(rootFile);
        const workspaces = project.getWorkspaces();
        expect(workspaces).toContainEqual(
          expect.objectContaining({
            name: fooJSON.name,
          })
        );
        expect(workspaces).toContainEqual(
          expect.objectContaining({
            name: barJSON.name,
          })
        );
      });
    });
  });

  describe(".getWorkspaceDependencies()", () => {
    test("returns zero dependencies when workspaces do not have any dependencies", () => {
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

      const dependencies = project.getWorkspaceDependencies(fooWorkspace);
      expect(dependencies).toHaveLength(0);
    });

    test("rerturns zero dependencies when a workspace does not depended on any other workspaces", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          express: "^4.17.0",
        },
      });
      const project = new Project(rootWorkspace, [fooWorkspace]);

      const dependencies = project.getWorkspaceDependencies(fooWorkspace);
      expect(dependencies).toHaveLength(0);
    });

    test("returns zero dependencies when a workspace depends on another workspace but the version is not in range", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(fooFile, {
        ...barJSON,
        version: "5.2.1",
      });
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

      const dependencies = project.getWorkspaceDependencies(fooWorkspace);
      expect(dependencies).toHaveLength(0);
    });

    test("returns dependencies when a workspace depends on another workspace and the version is in range", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
        version: "4.20.1",
      });
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

      const dependencies = project.getWorkspaceDependencies(fooWorkspace);
      expect(dependencies).toContainEqual(barWorkspace);
      expect(dependencies.length).toEqual(1);
    });

    test("returns recursive dependencies when a workspace depends on another workspace and recursive flag is set", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
        version: "4.20.1",
        dependencies: {
          barbar: "^1.2.0",
        },
      });
      const barbarWorkspace = new Workspace(barBarFile, {
        name: "barbar",
        version: "1.3.0",
      });
      const project = new Project(rootWorkspace, [
        fooWorkspace,
        barWorkspace,
        barbarWorkspace,
      ]);

      const dependencies = project.getWorkspaceDependencies(fooWorkspace, {
        recursive: true,
      });
      expect(dependencies).toContainEqual(barWorkspace);
      expect(dependencies).toContainEqual(barbarWorkspace);
      expect(dependencies.length).toEqual(2);
    });
  });

  describe(".getWorkspaceDependents()", () => {
    test("returns zero dependents when workspaces do not have any dependencies", () => {
      const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);

      const dependents = project.getWorkspaceDependents(barWorkspace);
      expect(dependents).toHaveLength(0);
    });

    test("returns zero dependents when a workspace is not depended on by another workspace", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          express: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
      });
      const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);

      const dependents = project.getWorkspaceDependents(barWorkspace);
      expect(dependents).toHaveLength(0);
    });

    test("returns zero dependents when a workspace is depended on by another workspace but the version is not in range", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
        version: "5.0.0",
      });
      const project = new Project(fooWorkspace, [fooWorkspace, barWorkspace]);

      const dependents = project.getWorkspaceDependents(barWorkspace);
      expect(dependents).toHaveLength(0);
    });

    test("returns a dependent when a workspace is depended on by another workspace and the version is in range", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
        version: "4.20.0",
      });
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

      const dependents = project.getWorkspaceDependents(barWorkspace);
      expect(dependents).toContainEqual(fooWorkspace);
      expect(dependents).toHaveLength(1);
    });

    test("returns dependents recursively when a workspace depends on another workspace", () => {
      const fooWorkspace = new Workspace(fooFile, {
        ...fooJSON,
        dependencies: {
          bar: "^4.17.0",
        },
      });
      const barWorkspace = new Workspace(barFile, {
        ...barJSON,
        version: "4.20.0",
        dependencies: {
          barbar: "^1.2.0",
        },
      });
      const barbarWorkspace = new Workspace(barBarFile, {
        name: "barbar",
        version: "1.3.0",
      });
      const project = new Project(rootWorkspace, [
        fooWorkspace,
        barWorkspace,
        barbarWorkspace,
      ]);

      const dependents = project.getWorkspaceDependents(barbarWorkspace, {
        recursive: true,
      });
      expect(dependents).toContainEqual(barWorkspace);
      expect(dependents).toContainEqual(fooWorkspace);
      expect(dependents).toHaveLength(2);
    });
  });

  describe(".getWorkspaces()", () => {
    describe("root", () => {
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

      test("does not include the root workspace by default ", () => {
        const workspaces = project.getWorkspaces();
        expect(workspaces).not.toContain(project.root);
      });

      test("does not include the root workspace when false ", () => {
        const workspaces = project.getWorkspaces({ root: false });
        expect(workspaces).not.toContain(project.root);
      });

      test("does include the root workspace when true ", () => {
        const workspaces = project.getWorkspaces({ root: true });
        expect(workspaces).toContainEqual(project.root);
      });
    });

    describe("diff", () => {
      const diff = { [fooFile]: "M" };
      const changedWorkspace = fooWorkspace;
      const unchangedWorkspace = barWorkspace;
      const project = new Project(rootWorkspace, [
        changedWorkspace,
        unchangedWorkspace,
      ]);

      test("does include unchanged workspaces when an argument for diff is not provided", () => {
        const workspaces = project.getWorkspaces();
        expect(workspaces).toContainEqual(unchangedWorkspace);
        expect(workspaces).toContainEqual(changedWorkspace);
      });

      test("does not include unchanged workspaces when an argument for diff is provided", () => {
        const workspaces = project.getWorkspaces({
          diff,
        });
        expect(workspaces).not.toContain(unchangedWorkspace);
      });

      test("does include changed workspaces when an argument for diff is provided", () => {
        const workspaces = project.getWorkspaces({
          diff,
        });
        expect(workspaces).toContainEqual(changedWorkspace);
      });
    });

    describe("dependencies", () => {
      test("does not include dependencies when an argument for dependencies is provided and dependencies do not exist", () => {
        const diff = { [fooFile]: "M" };
        const project = new Project(rootWorkspace, [
          fooWorkspace,
          barWorkspace,
        ]);
        const workspaces = project.getWorkspaces({
          diff,
          dependencies: true,
        });
        expect(workspaces).not.toContain(barWorkspace);
      });
      test("does include dependencies when an argument for dependencies is provided and dependencies exist", () => {
        const diff = { [fooFile]: "M" };
        const fooWorkspace = new Workspace(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        });
        const barWorkspace = new Workspace(barFile, {
          ...barJSON,
          version: "4.20.0",
        });
        const project = new Project(rootWorkspace, [
          fooWorkspace,
          barWorkspace,
        ]);
        const workspaces = project.getWorkspaces({
          diff,
          dependencies: true,
        });
        expect(workspaces).toContainEqual(barWorkspace);
      });
    });

    describe("dependents", () => {
      test("does not include dependents when an argument for dependents is provided and dependents do not exist", () => {
        const diff = { [barFile]: "M" };
        const project = new Project(rootWorkspace, [
          fooWorkspace,
          barWorkspace,
        ]);
        const workspaces = project.getWorkspaces({
          diff,
          dependents: true,
        });
        expect(workspaces).not.toContain(fooWorkspace);
      });
      test("does include dependents when an argument for dependents is provided and dependents exist", () => {
        const diff = { [barFile]: "M" };
        const fooWorkspace = new Workspace(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        });
        const barWorkspace = new Workspace(barFile, {
          ...barJSON,
          version: "4.20.0",
        });
        const project = new Project(rootWorkspace, [
          fooWorkspace,
          barWorkspace,
        ]);
        const workspaces = project.getWorkspaces({
          diff,
          dependents: true,
        });
        expect(workspaces).toContainEqual(fooWorkspace);
      });
    });
  });
});
