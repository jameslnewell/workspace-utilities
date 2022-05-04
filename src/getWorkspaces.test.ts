import {
  barFile,
  barJSON,
  barWorkspace,
  fooFile,
  fooJSON,
  fooWorkspace,
  rootWorkspace,
} from "./fixtures";
import { getWorkspaces } from "./getWorkspaces";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

describe(".getWorkspaces()", () => {
  describe("root", () => {
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

    test("does not include the root workspace by default ", () => {
      const workspaces = getWorkspaces(project);
      expect(workspaces).not.toContain(project.root);
    });

    test("does not include the root workspace when false ", () => {
      const workspaces = getWorkspaces(project, { includeRoot: false });
      expect(workspaces).not.toContain(project.root);
    });

    test("does include the root workspace when true ", () => {
      const workspaces = getWorkspaces(project, { includeRoot: true });
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
      const workspaces = getWorkspaces(project);
      expect(workspaces).toContainEqual(unchangedWorkspace);
      expect(workspaces).toContainEqual(changedWorkspace);
    });

    test("does not include unchanged workspaces when an argument for diff is provided", () => {
      const workspaces = getWorkspaces(project, {
        diff,
      });
      expect(workspaces).not.toContain(unchangedWorkspace);
    });

    test("does include changed workspaces when an argument for diff is provided", () => {
      const workspaces = getWorkspaces(project, {
        diff,
      });
      expect(workspaces).toContainEqual(changedWorkspace);
    });
  });

  describe("dependencies", () => {
    test("does not include dependencies when an argument for dependencies is provided and dependencies do not exist", () => {
      const diff = { [fooFile]: "M" };
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = getWorkspaces(project, {
        diff,
        includedependencies: true,
      });
      expect(workspaces).not.toContain(barWorkspace);
    });

    test("does include dependencies when an argument for dependencies is provided and dependencies exist", () => {
      const diff = { [fooFile]: "M" };
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        {}
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.0",
        }),
        {}
      );
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = getWorkspaces(project, {
        diff,
        includedependencies: true,
      });
      expect(workspaces).toContainEqual(barWorkspace);
    });
  });

  describe("dependents", () => {
    test("does not include dependents when an argument for dependents is provided and dependents do not exist", () => {
      const diff = { [barFile]: "M" };
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = getWorkspaces(project, {
        diff,
        includeDependents: true,
      });
      expect(workspaces).not.toContain(fooWorkspace);
    });
    test("does include dependents when an argument for dependents is provided and dependents exist", () => {
      const diff = { [barFile]: "M" };
      const fooWorkspace = new Workspace(
        new Manifest(fooFile, {
          ...fooJSON,
          dependencies: {
            bar: "^4.17.0",
          },
        }),
        {}
      );
      const barWorkspace = new Workspace(
        new Manifest(barFile, {
          ...barJSON,
          version: "4.20.0",
        }),
        {}
      );
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = getWorkspaces(project, {
        diff,
        includeDependents: true,
      });
      expect(workspaces).toContainEqual(fooWorkspace);
    });
  });
});
