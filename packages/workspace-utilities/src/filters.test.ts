import {
  directory,
  private as isPrivate,
  name,
  script,
  changed,
  not,
  or,
  and,
} from "./filters";
import { barDirectory, barWorkspace, fooDirectory, fooJSON, fooWorkspace } from "./fixtures";
import { Workspace } from "./Workspace";

describe("directory()", () => {
  test("matches directory with an exact string", () => {
    const matches = directory(fooDirectory)(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("matches directory with a glob", () => {
    const matches = directory("*/bar")(barWorkspace);
    expect(matches).toBeTruthy();
  });

  test("does not match directory with an exact string", () => {
    const matches = directory(barDirectory)(fooWorkspace);
    expect(matches).toBeFalsy();
  });

  test("does not match directory with a glob string", () => {
    const matches = directory("packages/b*")(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});

describe("private()", () => {
  test("matches private workspace", () => {
    const workspace = new Workspace(fooDirectory, {
        ...fooJSON,
        private: true,
      }
    );
    const matches = isPrivate()(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match public workspace", () => {
    const matches = isPrivate()(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});

describe("name()", () => {
  test("matches name with an exact string", () => {
    const matches = name("foo")(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("matches name with a glob", () => {
    const matches = name("f*")(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("does not match name with an exact string", () => {
    const matches = name("bar")(fooWorkspace);
    expect(matches).toBeFalsy();
  });

  test("does not match name with a glob string", () => {
    const matches = name("b*")(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});

describe("script()", () => {
  test("matches workspace with script", () => {
    const workspace = new Workspace(fooDirectory, {
        ...fooJSON,
        scripts: {
          test: "jest",
        },
      }
    );
    const matches = script("test")(workspace);
    expect(matches).toBeTruthy();
  });

  test("does not match workspace without script", () => {
    const matches = script("test")(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});


describe("changed()", () => {
  test("matches changed workspaces", () => {
    const diff = {
      [`${fooDirectory}/src/index.ts`]: 'M'
    }
    const matches = changed(diff)(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("does not match unchanged workspace", () => {
    const diff = {
      [`/some/directory/src/index.ts`]: 'M'
    }
    const matches = changed(diff)(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});


describe("not()", () => {
  test("does not match truthy filter", () => {
    const matches = not(() => true)(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});

describe("or()", () => {
  test("matches both filters", () => {
    const matches = or(
      () => true,
      () => true
    )(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("matches first filter", () => {
    const matches = or(
      () => false,
      () => true
    )(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("matches second filter", () => {
    const matches = or(
      () => true,
      () => false
    )(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("matches none of the filters", () => {
    const matches = or(
      () => false,
      () => false
    )(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});

describe("and()", () => {
  test("matches both filters", () => {
    const matches = and(
      () => true,
      () => true
    )(fooWorkspace);
    expect(matches).toBeTruthy();
  });

  test("does not match first filter", () => {
    const matches = and(
      () => false,
      () => true
    )(fooWorkspace);
    expect(matches).toBeFalsy();
  });

  test("does not match second filter", () => {
    const matches = and(
      () => true,
      () => false
    )(fooWorkspace);
    expect(matches).toBeFalsy();
  });

  test("matches none of the filters", () => {
    const matches = and(
      () => false,
      () => false
    )(fooWorkspace);
    expect(matches).toBeFalsy();
  });
});
