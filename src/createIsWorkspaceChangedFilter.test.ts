import { getDiff } from "./getDiff";
import { createIsWorkspaceChangedFilter } from "./createIsWorkspaceChangedFilter";
import { Manifest } from "./Manifest";
import { Workspace } from "./Workspace";
import { Project } from "./Project";

jest.mock("./getDiff");

describe("createIsWorkspaceChangedFilter()", () => {
  const mockGetDiff = getDiff as unknown as jest.Mock<
    ReturnType<typeof getDiff>
  >;
  mockGetDiff.mockResolvedValue(
    new Map<string, string>([["foo/package.json", "M"]])
  );

  const rootWorkspace = new Workspace(
    new Manifest("package.json", {
      name: "root",
      version: "1.0.0",
    })
  );
  const changedWorkspace = new Workspace(
    new Manifest("foo/package.json", {
      name: "foo",
      version: "1.0.0",
    })
  );
  const unchangedWorkspace = new Workspace(
    new Manifest("bar/package.json", {
      name: "bar",
      version: "1.0.0",
    })
  );
  const project = new Project(rootWorkspace, [
    changedWorkspace,
    unchangedWorkspace,
  ]);

  test("removes unchanged workspaces", async () => {
    const workspaces = [changedWorkspace, unchangedWorkspace];

    const isWorkspaceChanged = await createIsWorkspaceChangedFilter({
      project,
    });
    const changedWorkspaces = workspaces.filter(isWorkspaceChanged);

    expect(changedWorkspaces).not.toContain(unchangedWorkspace);
  });

  test("leaves changed workspaces", async () => {
    const workspaces = [changedWorkspace, unchangedWorkspace];

    const isWorkspaceChanged = await createIsWorkspaceChangedFilter({
      project,
    });
    const changedWorkspaces = workspaces.filter(isWorkspaceChanged);

    expect(changedWorkspaces).toContain(changedWorkspace);
  });
});
