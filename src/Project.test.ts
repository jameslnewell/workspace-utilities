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
        "packages/foo/package.json": JSON.stringify({
          name: "foo",
          version: "1.0.0",
        }),
        "packages/bar/package.json": JSON.stringify({
          name: "bar",
          version: "1.0.0",
        }),
      })
    );

    afterEach(() => createMockFilesystem.restore());

    describe(".root", () => {
      test("is the root workspace", async () => {
        const project = await Project.read(".");
        expect(project.root.name).toEqual("root");
      });
    });

    describe(".workspaces", () => {
      test("does not include the root workspace", async () => {
        const project = await Project.read(".");
        const workspaces = Array.from(project.workspaces);
        expect(workspaces).not.toContainEqual(
          expect.objectContaining({
            name: "root",
          })
        );
      });

      test("includes other workspaces", async () => {
        const project = await Project.read(".");
        const workspaces = project.workspaces;
        expect(workspaces).toContainEqual(
          expect.objectContaining({
            name: "bar",
          })
        );
        expect(workspaces).toContainEqual(
          expect.objectContaining({
            name: "foo",
          })
        );
      });
    });
  });
});
