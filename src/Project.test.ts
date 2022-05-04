import createMockFilesystem from "mock-fs";
import {
  barFile,
  barJSON,
  fooFile,
  fooJSON,
  rootDirectory,
  rootFile,
  rootJSON,
} from "./fixtures";
import { Project } from "./Project";

describe("Project", () => {
  describe(".fromDirectory()", () => {
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
        const project = await Project.fromDirectory(rootDirectory);
        expect(project.root.name).toEqual("root");
      });
    });

    describe(".workspaces()", () => {
      test("does not include the root workspace", async () => {
        const project = await Project.fromDirectory(rootDirectory);
        const workspaces = project.workspaces;
        expect(workspaces).not.toContainEqual(
          expect.objectContaining({
            name: rootJSON.name,
          })
        );
      });

      test("includes other workspaces", async () => {
        const project = await Project.fromDirectory(rootDirectory);
        const workspaces = project.workspaces;
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
});
