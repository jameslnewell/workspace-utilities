import createMockFilesystem from "mock-fs";
import { Project } from "./Project";

describe("Project", () => {
  describe(".read()", () => {
    beforeEach(() =>
      createMockFilesystem({
        "package.json": JSON.stringify({
          name: "root",
          version: "1.0.0",
          workspaces: ["packages/*"],
        }),
        "packages/bar/package.json": JSON.stringify({
          name: "bar",
          version: "1.0.0",
        }),
        "packages/foo/package.json": JSON.stringify({
          name: "foo",
          version: "1.0.0",
        }),
      })
    );

    afterEach(() => createMockFilesystem.restore());

    test("returns root workspace", async () => {
      const project = await Project.read(".");
      expect(project.root.name).toEqual("root");
    });

    test("returns other workspaces", async () => {
      const project = await Project.read(".");
      const workspaces = Array.from(project.workspaces);
      expect(workspaces[0]).toHaveProperty("name", "root");
      expect(workspaces[1]).toHaveProperty("name", "bar");
      expect(workspaces[2]).toHaveProperty("name", "foo");
    });
  });
});
