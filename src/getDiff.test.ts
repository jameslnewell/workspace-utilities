import { getDiff } from "./getDiff";
import { exec } from "./exec";

jest.mock("./exec");

const execMock = exec as unknown as jest.Mock<ReturnType<typeof exec>>;

describe("getDiff()", () => {
  const directory = ".";

  test("returns an empty map when an empty string is returned", async () => {
    execMock.mockResolvedValue({ stdout: "", stderr: "" });
    expect(await getDiff(directory)).toEqual({});
  });

  test("returns an empty map when whitespace is returned", async () => {
    execMock.mockResolvedValue({ stdout: " ", stderr: "" });
    expect(await getDiff(directory)).toEqual({});
  });

  test("returns an empty map when newlines are returned", async () => {
    execMock.mockResolvedValue({ stdout: "\n", stderr: "" });
    expect(await getDiff(directory)).toEqual({});
  });

  test("returns a map when a single file has changed", async () => {
    execMock.mockResolvedValue({ stdout: "M package.json", stderr: "" });
    expect(await getDiff(directory)).toEqual({
      "package.json": "M",
    });
  });

  test("returns a map when multiple files have changed", async () => {
    execMock.mockResolvedValue({
      stdout: "M package.json\nA README.md",
      stderr: "",
    });
    expect(await getDiff(directory)).toEqual({
      "README.md": "A",
      "package.json": "M",
    });
  });
});
