
import { exec } from "./exec";
import { debug } from "./debug";

const log = debug.extend('getDiff')


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
  
  log("git", args)

  const { stdout } = await exec("git", args, {
    cwd,
  });
  
  return stdout.trim();
}
