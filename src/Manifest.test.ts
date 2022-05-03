import createMockFilesystem from "mock-fs";
import { DependencyType } from "./DependencyType";
import { Manifest } from "./Manifest";

describe("Manifest", () => {
  const file = "packages/foo/package.json";
  const json = { name: "foo", version: "1.0.0" };
  const manifest = new Manifest(file, json);

  describe(".file", () => {
    test("returns the same file as the file passed to the constructor", () => {
      expect(manifest.file).toEqual(file);
    });
  });

  describe(".json", () => {
    test("returns the same json as the json passed to the constructor", () => {
      expect(manifest.json).toEqual(json);
    });
  });

  describe(".private", () => {
    test("returns the false when not specified", () => {
      expect(manifest.private).toBeFalsy();
    });
    test("returns the false when false", () => {
      expect(manifest.private).toBeFalsy();
    });
    test("returns the true when true", () => {
      const manifest = new Manifest(file, { ...json, private: true });
      expect(manifest.private).toBeTruthy();
    });
  });

  describe(".name", () => {
    test("returns the same name as the name passed to the constructor", () => {
      expect(manifest.name).toEqual(json.name);
    });
  });

  describe(".version", () => {
    test("returns the same version as the version passed to the constructor", () => {
      expect(manifest.version).toEqual(json.version);
    });
  });

  describe(".workspaces", () => {
    test("returns an empty array when JSON does not contain workspace configuration", () => {
      const manifest = new Manifest(file, json);
      expect(manifest.workspaces).toHaveLength(0);
    });

    test("returns an array of patterns when JSON contains a simple workspace configuration", () => {
      const manifest = new Manifest(file, {
        ...json,
        workspaces: ["packages/*", "website"],
      });

      expect(manifest.workspaces).toEqual(["packages/*", "website"]);
    });

    test("returns an array of patterns when JSON contains a complex workspace configuration", () => {
      const manifest = new Manifest(file, {
        ...json,
        workspaces: {
          packages: ["packages/*", "website"],
        },
      });
      expect(manifest.workspaces).toEqual(["packages/*", "website"]);
    });
  });

  describe(".scripts", () => {
    test("returns an empty object when JSON does not contain scripts", () => {
      const manifest = new Manifest(file, json);
      expect(manifest.scripts).toEqual({});
    });

    test("returns a populated object when JSON contains scripts", () => {
      const scripts = { test: "jest" };
      const manifest = new Manifest(file, { ...json, scripts });
      expect(manifest.scripts).toEqual(scripts);
    });
  });

  describe(".dependencies()", () => {
    test("returns zero dependencies when JSON does not contain dependencies", () => {
      const manifest = new Manifest(file, json);
      expect(Object.fromEntries(manifest.getDependencies())).toEqual({});
    });

    test("returns dependencies when JSON contains dependencies", () => {
      const manifest = new Manifest(file, {
        ...json,
        dependencies: {
          express: "^4.17.0",
        },
        devDependencies: {
          "@types/express": "^4.17.0",
        },
      });
      expect(Object.fromEntries(manifest.getDependencies())).toEqual({
        express: "^4.17.0",
        "@types/express": "^4.17.0",
      });
    });

    test("returns dependencies when JSON contains and a specific type is specified", () => {
      const manifest = new Manifest(file, {
        ...json,
        dependencies: {
          express: "^4.17.0",
        },
        devDependencies: {
          "@types/express": "^4.17.0",
        },
      });
      expect(
        Object.fromEntries(
          manifest.getDependencies([DependencyType.Dependencies])
        )
      ).toEqual({
        express: "^4.17.0",
      });
    });
  });

  describe(".fromFile()", () => {
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
        Manifest.fromFile("does-not-exist/package.json")
      ).rejects.toHaveProperty("message", expect.stringContaining("ENOENT"));
    });

    test("rejects when file does not contain valid json", async () => {
      await expect(
        Manifest.fromFile("does-not-contain-valid-json/package.json")
      ).rejects.toHaveProperty(
        "message",
        expect.stringContaining("Unexpected token")
      );
    });

    test("rejects when file does not contain a json object", async () => {
      await expect(
        Manifest.fromFile("does-not-contain-json-object/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid manifest"),
      });
    });

    test("rejects when file does not have a name", async () => {
      await expect(
        Manifest.fromFile("does-not-contain-name/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid name"),
      });
    });

    test("rejects when file does not have a version", async () => {
      await expect(
        Manifest.fromFile("does-not-contain-version/package.json")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid version"),
      });
    });

    test("resolves a manifest with the correct file", async () => {
      await expect(
        Manifest.fromFile("valid/package.json")
      ).resolves.toHaveProperty("file", "valid/package.json");
    });

    test("resolves a manifest with the correct json", async () => {
      await expect(
        Manifest.fromFile("valid/package.json")
      ).resolves.toHaveProperty("json", {
        name: "name",
        version: "1.0.0",
      });
    });
  });
});
