import createMockFilesystem from "mock-fs";
import { Manifest } from "./Manifest";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

const workspacesByName: Record<string, Workspace> = {};

const rootDirectory = "";
const rootFile = "package.json";
const rootJSON = {
  name: "root",
  version: "1.0.0",
  workspaces: ["packages/*"],
};
const rootManifest = new Manifest(rootFile, rootJSON);
const rootWorkspace = new Workspace(rootManifest, workspacesByName);

const fooFile = "packages/foo/package.json";
const fooJSON = {
  name: "foo",
  version: "1.2.3",
};
const fooManifest = new Manifest(fooFile, fooJSON);
const fooWorkspace = new Workspace(fooManifest, workspacesByName);

const barFile = "packages/bar/package.json";
const barJSON = {
  name: "bar",
  version: "4.5.6",
};
const barManifest = new Manifest(barFile, barJSON);
const barWorkspace = new Workspace(barManifest, workspacesByName);

const barBarFile = "barbar/package.json";

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
