import {
  barDiff,
  barFile,
  barJSON,
  barWorkspace,
  fooDiff,
  fooFile,
  fooJSON,
  fooWorkspace,
  rootWorkspace,
  since,
} from "./fixtures";
import { getWorkspaces } from "./getWorkspaces";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";
import { getDiff } from "./getDiff";

jest.mock("./getDiff");

const getDiffMock = getDiff as unknown as jest.Mock<ReturnType<typeof getDiff>>;

describe(".getWorkspaces()", () => {
  describe("root", () => {
    const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

    test("does not include the root workspace by default ", async () => {
      const workspaces = await getWorkspaces(project);
      expect(workspaces).not.toContain(project.root);
    });

    test("does not include the root workspace when false ", async () => {
      const workspaces = await getWorkspaces(project, { excludeRoot: true });
      expect(workspaces).not.toContain(project.root);
    });

    test("does include the root workspace when true ", async () => {
      const workspaces = await getWorkspaces(project, { excludeRoot: false });
      expect(workspaces).toContain(project.root);
    });
  });

  describe("diff", () => {
    const changedWorkspace = fooWorkspace;
    const unchangedWorkspace = barWorkspace;
    const project = new Project(rootWorkspace, [
      changedWorkspace,
      unchangedWorkspace,
    ]);

    beforeEach(() => {
      getDiffMock.mockResolvedValue(fooDiff);
    });

    test("does include unchanged workspaces when an argument for since is not provided", async () => {
      const workspaces = await getWorkspaces(project);
      expect(workspaces).toContain(unchangedWorkspace);
      expect(workspaces).toContain(changedWorkspace);
    });

    test("does not include unchanged workspaces when an argument for since is provided", async () => {
      const workspaces = await getWorkspaces(project, {
        since,
      });
      expect(workspaces).not.toContain(unchangedWorkspace);
    });

    test("does include changed workspaces when an argument for since is provided", async () => {
      const workspaces = await getWorkspaces(project, {
        since,
      });
      expect(workspaces).toContain(changedWorkspace);
    });
  });

  describe("includeDependencies", () => {
    beforeEach(() => {
      getDiffMock.mockResolvedValue(fooDiff);
    });

    test("does not include dependencies when an argument for dependencies is provided and dependencies do not exist", async () => {
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = await getWorkspaces(project, {
        since,
        includedependencies: true,
      });
      expect(workspaces).not.toContain(barWorkspace);
    });

    test("does include dependencies when an argument for dependencies is provided and dependencies exist", async () => {
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
      const workspaces = await getWorkspaces(project, {
        since,
        includedependencies: true,
      });
      expect(workspaces).toContainEqual(barWorkspace);
    });
  });

  describe("includeDependents", () => {
    beforeEach(() => {
      getDiffMock.mockResolvedValue(barDiff);
    });

    test("does not include dependents when an argument for dependents is provided and dependents do not exist", async () => {
      const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
      const workspaces = await getWorkspaces(project, {
        since,
        includeDependents: true,
      });
      expect(workspaces).not.toContain(fooWorkspace);
    });
    test("does include dependents when an argument for dependents is provided and dependents exist", async () => {
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
      const workspaces = await getWorkspaces(project, {
        since,
        includeDependents: true,
      });
      expect(workspaces).toContainEqual(fooWorkspace);
    });
  });
});
