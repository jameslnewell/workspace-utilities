
import { exec } from "./exec";

export interface GetMergeBaseOptions {
  cwd?: string
}

export type GetMergeBaseResult = string

export async function getMergeBase(
  commit1: string,
  commit2: string,
  { cwd }: GetMergeBaseOptions = {}
): Promise<string> {
  const args = ["merge-base", commit1, commit2];
  const { stdout } = await exec("git", args, {
    cwd,
  });
  return stdout.trim();
}
