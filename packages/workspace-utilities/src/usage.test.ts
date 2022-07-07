import fs from 'fs/promises'
import glob from "fast-glob";
import { Project } from "./Project";
import { private as isPrivate, not, changed, script } from "./filters";
import { barFile, barJSON, fooFile, fooJSON, fooName, fooVersion, rootDirectory, rootJSON, rootName, rootVersion } from "./fixtures";

const mockFS = jest.mocked(fs)
const mockGlob = jest.mocked(glob)

jest.mock('fs/promises')
jest.mock('fast-glob')

describe("usage", () => {
  afterEach(() => jest.clearAllMocks());

  test("get changed workspaces", async () => {
    const diff = {
      ["packages/changed-package/src/index.ts"]: "M",
    };
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(rootJSON))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      name: 'changed-package',
      version: '1.2.3',
    }))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      private: true,
      name: 'unchanged-package',
      version: '4.5.6'
    }))
    mockGlob.mockResolvedValueOnce(['packages/changed-package/package.json', 'packages/unchanged-package/package.json'])

    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.children.filter(changed(diff));

    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "changed-package" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "unchanged-package" })
    );
  });

  test("get public workspaces", async () => {
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(rootJSON))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      name: 'public',
      version: '1.2.3',
    }))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      private: true,
      name: 'private',
      version: '4.5.6'
    }))
    mockGlob.mockResolvedValueOnce(['packages/public/package.json', 'packages/private/package.json'])

    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.children.filter(not(isPrivate()));

    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "public" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "private" })
    );
  });

  test("get workspaces which have a test script", async () => {
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(rootJSON))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      name: 'with-script',
      version: '1.2.3',
      scripts: {
        'test': "echo 'test'"
      }
    }))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify({
      name: 'without-script',
      version: '4.5.6'
    }))
    mockGlob.mockResolvedValueOnce(['packages/with-script/package.json', 'packages/without-script/package.json'])

    const project = await Project.fromDirectory(rootDirectory);
    const workspaces = project.children.filter(script("test"));

    expect(workspaces).toContainEqual(
      expect.objectContaining({ name: "with-script" })
    );
    expect(workspaces).not.toContainEqual(
      expect.objectContaining({ name: "without-script" })
    );
  });

  test("README", async () => {
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(rootJSON))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(fooJSON))
    mockFS.readFile.mockResolvedValueOnce(JSON.stringify(barJSON))
    mockGlob.mockResolvedValueOnce([fooFile, barFile])

    const project = await Project.fromDirectory(process.cwd())
    const workspaces = project.children
      .map(workspace => `${workspace.name}@${workspace.version}`);
    
    expect(workspaces).toContainEqual(`${fooName}@${fooVersion}`);
    expect(workspaces).not.toContainEqual(
      `${rootName}@${rootVersion}`
    );
  });
});
