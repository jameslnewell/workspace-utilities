import {
  barFile,
  barJSON,
  fooFile,
  fooJSON,
  rootDirectory,
  rootJSON,
} from "./fixtures";
import fs from 'fs/promises'
import glob from "fast-glob";
import { Project } from "./Project";

jest.mock('fs/promises')
jest.mock('fast-glob')

const mockFS = jest.mocked(fs)
const mockGlob = jest.mocked(glob)

afterEach(() => jest.clearAllMocks());

function mockWithStockFiles() {
  mockFS.readFile.mockResolvedValueOnce(JSON.stringify(rootJSON))
  mockFS.readFile.mockResolvedValueOnce(JSON.stringify(fooJSON))
  mockFS.readFile.mockResolvedValueOnce(JSON.stringify(barJSON))
  mockGlob.mockResolvedValueOnce([fooFile, barFile])
}

describe("Project", () => {
  describe(".fromDirectory()", () => {

    describe(".root", () => {
      test("is the root workspace", async () => {
        mockWithStockFiles()

        const project = await Project.fromDirectory(rootDirectory);
        expect(project.root.name).toEqual("root");
      });
    });

    describe(".children()", () => {
      test("does not include the root workspace", async () => {
        mockWithStockFiles()

        const project = await Project.fromDirectory(rootDirectory);
        const workspaces = project.children;
        expect(workspaces).not.toContainEqual(
          expect.objectContaining({
            name: rootJSON.name,
          })
        );
      });

      test("includes other workspaces when workspaces is an array", async () => {
        mockWithStockFiles()

        const project = await Project.fromDirectory(rootDirectory);
        const workspaces = project.children;

        expect(mockGlob).toBeCalledWith([
          'packages/*/package.json',
        ], expect.objectContaining({}))
        
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

      test("includes other workspaces when workspaces is an object", async () => {
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify({...rootJSON, workspaces: {packages: rootJSON.workspaces}}))
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify(fooJSON))
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify(barJSON))
        mockGlob.mockResolvedValueOnce([fooFile, barFile])

        const project = await Project.fromDirectory(rootDirectory);
        const workspaces = project.children;

        expect(mockGlob).toBeCalledWith([
          'packages/*/package.json',
        ], expect.objectContaining({}))
        
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

      test("does not include other workspaces when workspaces is undefined", async () => {        
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify({...rootJSON, workspaces: undefined}))
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify(fooJSON))
        mockFS.readFile.mockResolvedValueOnce(JSON.stringify(barJSON))
        mockGlob.mockResolvedValueOnce([])

        const project = await Project.fromDirectory(rootDirectory);

        expect(mockGlob).toBeCalledWith([
        ], expect.objectContaining({}))
        
        const workspaces = project.children;
        expect(workspaces).toHaveLength(0);
      });
    });
  });
});
