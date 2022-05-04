import {
  nameMatches,
  directoryMatches,
  scriptExists,
  isPrivate,
  not,
  or,
  and,
} from ".";
import { Manifest } from "../Manifest";
import { Workspace } from "../Workspace";

const workspacesByName = {};

describe("nameMatches()", () => {
  test("matches name with an exact string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = nameMatches("foo")(workspace);
    expect(matches).toBeTruthy();
  });

  test("matches name with a glob", () => {
    const workspace = new Workspace(
      new Manifest("packages/bar/package.json", {
        name: "@foo/bar",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = nameMatches("@foo/*")(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match name with an exact string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = nameMatches("bar")(workspace);
    expect(matches).toBeFalsy();
  });

  test("does not match name with a glob string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = nameMatches("b*")(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("directoryMatches()", () => {
  test("matches directory with an exact string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = directoryMatches("packages/foo")(workspace);
    expect(matches).toBeTruthy();
  });

  test("matches directory with a glob", () => {
    const workspace = new Workspace(
      new Manifest("packages/bar/package.json", {
        name: "@foo/bar",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = directoryMatches("*/bar")(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match directory with an exact string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = directoryMatches("pacakges/bar")(workspace);
    expect(matches).toBeFalsy();
  });

  test("does not match directory with a glob string", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = directoryMatches("packages/b*")(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("scriptExists()", () => {
  test("matches workspace with script", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
        scripts: {
          test: "jest",
        },
      }),
      workspacesByName
    );
    const matches = scriptExists("test")(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match workspace without script", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = scriptExists("test")(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("isPrivate()", () => {
  test("matches private workspace", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        private: true,
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = isPrivate()(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match public workspace", () => {
    const workspace = new Workspace(
      new Manifest("packages/foo/package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = isPrivate()(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("not()", () => {
  test("does not match truthy filter", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = not(() => true)(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("or()", () => {
  test("matches both filters", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = or(
      () => true,
      () => true
    )(workspace);
    expect(matches).toBeTruthy();
  });
  test("matches first filter", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = or(
      () => false,
      () => true
    )(workspace);
    expect(matches).toBeTruthy();
  });
  test("matches second filter", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = or(
      () => true,
      () => false
    )(workspace);
    expect(matches).toBeTruthy();
  });
  test("matches none of the filters", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = or(
      () => false,
      () => false
    )(workspace);
    expect(matches).toBeFalsy();
  });
});

describe("and()", () => {
  test("matches both filters", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = and(
      () => true,
      () => true
    )(workspace);
    expect(matches).toBeTruthy();
  });
  test("does not match first filter", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = and(
      () => false,
      () => true
    )(workspace);
    expect(matches).toBeFalsy();
  });
  test("does not match second filter", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = and(
      () => true,
      () => false
    )(workspace);
    expect(matches).toBeFalsy();
  });
  test("matches none of the filters", () => {
    const workspace = new Workspace(
      new Manifest("package.json", {
        name: "foo",
        version: "1.0.0",
      }),
      workspacesByName
    );
    const matches = and(
      () => false,
      () => false
    )(workspace);
    expect(matches).toBeFalsy();
  });
});
