import { parse } from "./parse";

describe("parse()", () => {
  test("include dependents", () => {
    const attributes = parse("...foo");
    expect(attributes.includeDependents).toBeTruthy();
  });

  test("include dependents but exclude self", () => {
    const attributes = parse("...^foo");
    expect(attributes.excludeSelf).toBeTruthy();
    expect(attributes.includeDependents).toBeTruthy();
  });

  test("do not include dependents", () => {
    const attributes = parse("foo");
    expect(attributes.includeDependents).toBeFalsy();
  });

  test("include dependencies", () => {
    const attributes = parse("foo...");
    expect(attributes.includeDependencies).toBeTruthy();
  });

  test("include dependencies but exclude self", () => {
    const attributes = parse("foo^...");
    expect(attributes.excludeSelf).toBeTruthy();
    expect(attributes.includeDependencies).toBeTruthy();
  });

  test("do not include dependencies", () => {
    const attributes = parse("foo");
    expect(attributes.includeDependencies).toBeFalsy();
  });
});
