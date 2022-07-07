import fs from 'fs/promises'
import { DependencyType } from "./DependencyType";
import { Workspace } from "./Workspace";

jest.mock('fs/promises')

const mockFS = jest.mocked(fs)

afterEach(() => jest.clearAllMocks());

describe("Workspace", () => {
  const directory = "packages/foo";
  const name = 'foo'
  const version = '1.0.0'
  const json = { name, version };
  const workspace = new Workspace(directory, json);

  describe(".directory", () => {
    test("returns the directory containing the JSON file", () => {
      expect(workspace.directory).toEqual(directory);
    });
  });

  describe(".json", () => {
    test("returns the JSON", () => {
      expect(workspace.json).toEqual(json);
    });
  });

  describe(".private", () => {
    test("returns true when true in the JSON", () => {
      const workspace = new Workspace(directory, {...json, private: true});
      expect(workspace.private).toBeTruthy();
    });
    test("returns false when false in the JSON", () => {
      const workspace = new Workspace(directory, {...json, private: false});
      expect(workspace.private).toBeFalsy();
    });
    test("returns false when undefined in the JSON", () => {
      const workspace = new Workspace(directory, {...json, private: undefined});
      expect(workspace.private).toBeFalsy();
    });
  });

  describe(".name", () => {
    test("returns the name from the JSON", () => {
      expect(workspace.name).toEqual(name);
    });
  });

  describe(".version", () => {
    test("returns the name from the JSON", () => {
      expect(workspace.version).toEqual(version);
    });
  });

  describe(".scripts()", () => {
    test("returns an empty object when undefined in the JSON", () => {
      const workspace = new Workspace(directory, {...json, scripts: undefined});
      expect(workspace.scripts).toEqual({});
    });

    test("returns an empty object when undefined in the JSON", () => {
      const scripts = {foo: 'bar'}
      const workspace = new Workspace(directory, {...json, scripts});
      expect(workspace.scripts).toEqual(scripts);
    });

  });

  describe(".dependencies()", () => {
    test("returns an empty object when undefined in the JSON", () => {
      const workspace = new Workspace(directory, json);
      expect(Object.fromEntries(workspace.dependencies())).toEqual({});
    });

    test("returns dependencies and devDependencies when type is undefined", () => {
      const workspace = new Workspace(directory, {
        ...json,
        peerDependencies: {
          stuff: 'version'
        },
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

    test("returns dependencies when type is Dependencies", () => {
      const workspace = new Workspace(directory, {
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
          workspace.dependencies([DependencyType.Dependencies])
        )
      ).toEqual({
        express: "^4.17.0",
      });
    });

    test("returns dependencies when type is DevelopmentDependencies", () => {
      const workspace = new Workspace(directory, {
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
          workspace.dependencies([DependencyType.DevelopmentDependencies])
        )
      ).toEqual({
        "@types/express": "^4.17.0",
      });
    });
  });

  describe('.fromDirectory()', () => {

    test("rejects when file does not exist", async () => {
      mockFS.readFile.mockRejectedValueOnce(new Error('ENOENT'))
      await expect(
        Workspace.fromDirectory("does-not-exist")
      ).rejects.toHaveProperty("message", expect.stringContaining("ENOENT"));
    });

    test("rejects when file does not contain valid json", async () => {
      mockFS.readFile.mockResolvedValueOnce('x$%')
      await expect(
        Workspace.fromDirectory("does-not-contain-valid-json")
      ).rejects.toHaveProperty(
        "message",
        expect.stringContaining("Unexpected token")
      );
    });

    test("rejects when file does not contain a json object", async () => {
      mockFS.readFile.mockResolvedValueOnce('"string"')
      await expect(
        Workspace.fromDirectory("does-not-contain-json-object")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid manifest"),
      });
    });

    test("rejects when file does not have a name", async () => {
      mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
        version: "1.2.3"
      }))
      await expect(
        Workspace.fromDirectory("does-not-contain-name")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid name"),
      });
    });

    test("rejects when file does not have a version", async () => {
      mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
        name: "foobar"
      }))
      await expect(
        Workspace.fromDirectory("does-not-contain-version")
      ).rejects.toMatchObject({
        message: expect.stringContaining("doesn't contain a valid version"),
      });
    });

    test("resolves a workspace with the correct directory", async () => {
      mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
        name: "foobar",
        version: "1.2.3"
      }))
      await expect(
        Workspace.fromDirectory("valid")
      ).resolves.toHaveProperty("directory", "valid");
    });

    test("resolves a workspace with the correct json", async () => {
      mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
        name: "foobar",
        version: "1.2.3"
      }))
      await expect(
        Workspace.fromDirectory("valid")
      ).resolves.toHaveProperty("json", {
        name: "foobar",
        version: "1.2.3",
      });
    });
  })

});
