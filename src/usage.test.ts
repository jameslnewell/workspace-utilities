import path from "path";
import createMockFilesystem from "mock-fs";
import { Project } from "./Project";
import { isPrivate, not, hasChanged, scriptExists } from "./filters";
import { getWorkspaces } from "./getWorkspaces";

const rootDirectory = ".";

describe("usage", () => {
  beforeEach(() => {
    createMockFilesystem({
      "package.json": JSON.stringify({
        name: "root",
        version: "1.0.0",
        workspaces: ["packages/*"],
      }),
      "packages/foo/package.json": JSON.stringify({
        name: "foo",
        version: "1.0.0",
      }),
      "packages/bar/package.json": JSON.stringify({
        name: "bar",
        version: "1.0.0",
      }),
      "packages/public/package.json": JSON.stringify({
        name: "public",
        version: "1.0.0",
      }),
      "packages/private/package.json": JSON.stringify({
        private: true,
        name: "private",
        version: "1.0.0",
      }),
      "packages/with-script/package.json": JSON.stringify({
        name: "with-script",
        version: "1.0.0",
        scripts: {
          test: "jest",
        },
      }),
      "packages/without-script/package.json": JSON.stringify({
        name: "without-script",
        version: "1.0.0",
      }),
      "packages/changed-package/package.json": JSON.stringify({
        name: "changed-package",
        version: "1.0.0",
      }),
      "packages/unchanged-package/package.json": JSON.stringify({
        name: "unchanged-package",
        version: "1.0.0",
      }),
    });
  });

  afterEach(() => createMockFilesystem.restore());

  test("get changed workspaces", async () => {
    const diff = {
      [path.resolve("packages/changed-package/src/index.ts")]: "M",
    };
    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.workspaces.filter(hasChanged({ diff }));
    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "changed-package" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "unchanged-package" })
    );
  });

  test("get public workspaces", async () => {
    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.workspaces.filter(not(isPrivate()));
    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "public" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "private" })
    );
  });

  test("get workspaces which have script", async () => {
    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.workspaces.filter(scriptExists("test"));
    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "with-script" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "without-script" })
    );
  });

  test("README", async () => {
    const workspaces = await getWorkspaces(
      await Project.fromDirectory(rootDirectory),
      {
        // TODO:
        // since: process.env.SINCE,
        includeDependents: "recursive",
      }
    );
    expect(workspaces).toContainEqual(expect.objectContaining({ name: "foo" }));
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "root" })
    );
  });
});
