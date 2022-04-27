import createMockFilesystem from "mock-fs";
import { Workspace } from "./Workspace";

const rootFile = "package.json";
const rootJSON = {
  name: "root",
  version: "1.0.0",
  workspaces: ["packages/*"],
};

describe("Workspace", () => {
  describe(".fromJSONFile()", () => {
    beforeEach(() =>
      createMockFilesystem({
        "does-not-contain-valid-json/package.json": "x$%",
        "does-not-contain-json-object/package.json": JSON.stringify(false),
        "does-not-contain-name/package.json": JSON.stringify({
          version: "test",
        }),
        "does-not-contain-version/package.json": JSON.stringify({
          name: "test",
        }),
        "valid/package.json": JSON.stringify({
          name: "name",
          version: "1.0.0",
        }),
      })
    );

    afterEach(() => createMockFilesystem.restore());

    test("rejects when file does not exist", async () => {
      await expect(
        Workspace.fromFile("does-not-exist/package.json")
      ).rejects.toHaveProperty("message", expect.stringContaining("ENOENT"));
    });

    test("rejects when file does not contain valid json", async () => {
      await expect(
        Workspace.fromFile("does-not-contain-valid-json/package.json")
      ).rejects.toHaveProperty(
        "message",
        expect.stringContaining("Unexpected token")
      );
    });

    test("rejects when file does not contain a json object", async () => {
      await expect(
        Workspace.fromFile("does-not-contain-json-object/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid manifest"),
      });
    });

    test("rejects when file does not have a name", async () => {
      await expect(
        Workspace.fromFile("does-not-contain-name/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid name"),
      });
    });

    test("rejects when file does not have a version", async () => {
      await expect(
        Workspace.fromFile("does-not-contain-version/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid version"),
      });
    });

    test("resolves a manifest with the correct file", async () => {
      await expect(
        Workspace.fromFile("valid/package.json")
      ).resolves.toHaveProperty("file", "valid/package.json");
    });

    test("resolves a manifest with the correct json", async () => {
      await expect(
        Workspace.fromFile("valid/package.json")
      ).resolves.toHaveProperty("json", {
        name: "name",
        version: "1.0.0",
      });
    });
  });

  describe(".workspaces", () => {
    test("returns an empty array when no workspace configuration is provided", () => {
      const rootWorkspace = new Workspace(rootFile, {
        ...rootJSON,
        workspaces: undefined,
      });
      expect(rootWorkspace.workspaces).toHaveLength(0);
    });
    test("returns an array of patterns when a simple workspace configuration is provided", () => {
      const rootWorkspace = new Workspace(rootFile, {
        ...rootJSON,
        workspaces: ["packages/*", "website"],
      });
      expect(rootWorkspace.workspaces).toEqual(["packages/*", "website"]);
    });
    test("returns an array of patterns when a complex workspace configuration is provided", () => {
      const rootWorkspace = new Workspace(rootFile, {
        ...rootJSON,
        workspaces: {
          packages: ["packages/*", "website"],
        },
      });
      expect(rootWorkspace.workspaces).toEqual(["packages/*", "website"]);
    });
  });

  describe(".dependencies()", () => {
    test("returns zero dependencies when the default properties do not contain dependencies", () => {
      const workspace = new Workspace(rootFile, rootJSON);
      expect(Object.fromEntries(workspace.dependencies())).toEqual({});
    });

    test("returns dependencies when the default properties do contain dependencies", () => {
      const workspace = new Workspace(rootFile, {
        ...rootJSON,
        dependencies: {
          express: "^4.17.0",
        },
        devDependencies: {
          "@types/express": "^4.17.0",
        },
      });
      expect(Object.fromEntries(workspace.dependencies())).toEqual({
        express: "^4.17.0",
        "@types/express": "^4.17.0",
      });
    });
  });

  test("returns dependencies when the specified properties do contain dependencies", () => {
    const workspace = new Workspace(rootFile, {
      ...rootJSON,
      dependencies: {
        express: "^4.17.0",
      },
      devDependencies: {
        "@types/express": "^4.17.0",
      },
    });
    expect(
      Object.fromEntries(workspace.dependencies(["dependencies"]))
    ).toEqual({
      express: "^4.17.0",
    });
  });

  describe(".script()", () => {
    test("returns the script when there is a script with the specified name", () => {
      const workspace = new Workspace(rootFile, {
        ...rootJSON,
        scripts: {
          test: "jest",
        },
      });
      expect(workspace.script("test")).toEqual("jest");
    });

    test("returns undefined when there is no script with the specified name", () => {
      const workspace = new Workspace(rootFile, {
        ...rootJSON,
        scripts: {
          test: "jest",
        },
      });
      expect(workspace.script("start")).toBeUndefined();
    });
  });
});
