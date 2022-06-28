import { getMergeBase } from "./getMergeBase";
import { exec } from "./exec";

jest.mock("./exec");

const execMock = exec as unknown as jest.Mock<ReturnType<typeof exec>>;

describe("getMergeBase()", () => {

  test("returns a string when a merge base is returned", async () => {
    execMock.mockResolvedValue({ stdout: "7384f9fb3a97cf334b1871d40512c03dd449cb9b\n", stderr: "" });
    expect(await getMergeBase('a', 'b')).toEqual('7384f9fb3a97cf334b1871d40512c03dd449cb9b');
  });

});
