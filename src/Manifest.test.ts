import createMockFilesystem from "mock-fs";
import { Manifest } from "./Manifest";

describe("Manifest", () => {
  describe(".read()", () => {
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
        Manifest.read("does-not-exist/package.json")
      ).rejects.toHaveProperty("message", expect.stringContaining("ENOENT"));
    });

    test("rejects when file does not contain valid json", async () => {
      await expect(
        Manifest.read("does-not-contain-valid-json/package.json")
      ).rejects.toHaveProperty(
        "message",
        expect.stringContaining("Unexpected token")
      );
    });

    test("rejects when file does not contain a json object", async () => {
      await expect(
        Manifest.read("does-not-contain-json-object/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid manifest"),
      });
    });

    test("rejects when file does not have a name", async () => {
      await expect(
        Manifest.read("does-not-contain-name/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid name"),
      });
    });

    test("rejects when file does not have a version", async () => {
      await expect(
        Manifest.read("does-not-contain-version/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid version"),
      });
    });

    test("resolves a manifest with the correct file", async () => {
      await expect(Manifest.read("valid/package.json")).resolves.toHaveProperty(
        "file",
        "valid/package.json"
      );
    });

    test("resolves a manifest with the correct json", async () => {
      await expect(Manifest.read("valid/package.json")).resolves.toHaveProperty(
        "json",
        {
          name: "name",
          version: "1.0.0",
        }
      );
    });
  });

  describe(".workspaces", () => {
    test("returns an empty array when no workspace configuration is provided", () => {
      const manifest = new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      });
      expect(manifest.workspaces).toHaveLength(0);
    });
    test("returns an array of patterns when a simple workspace configuration is provided", () => {
      const manifest = new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
        workspaces: ["packages/*", "website"],
      });
      expect(manifest.workspaces).toEqual(["packages/*", "website"]);
    });
    test("returns an array of patterns when a complex workspace configuration is provided", () => {
      const manifest = new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
        workspaces: {
          packages: ["packages/*", "website"],
        },
      });
      expect(manifest.workspaces).toEqual(["packages/*", "website"]);
    });
  });

  describe(".dependencies()", () => {
    test("returns zero dependencies when the default properties do not contain dependencies", () => {
      const manifest = new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      });
      expect(Object.fromEntries(manifest.dependencies())).toEqual({});
    });

    test("returns dependencies when the default properties do contain dependencies", () => {
      const manifest = new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
        dependencies: {
          express: "^4.17.0",
        },
        devDependencies: {
          "@types/express": "^4.17.0",
        },
      });
      expect(Object.fromEntries(manifest.dependencies())).toEqual({
        express: "^4.17.0",
        "@types/express": "^4.17.0",
      });
    });
  });

  test("returns dependencies when the specified properties do contain dependencies", () => {
    const manifest = new Manifest("package.json", {
      name: "foo",
      version: "1.0.0",
      dependencies: {
        express: "^4.17.0",
      },
      devDependencies: {
        "@types/express": "^4.17.0",
      },
    });
    expect(Object.fromEntries(manifest.dependencies(["dependencies"]))).toEqual(
      {
        express: "^4.17.0",
      }
    );
  });
});
