import path from "path";
import { exec } from "./exec";
import { debug } from "./debug";

const log = debug.extend('getDiff')

export interface GetDiffOptions {
  cwd?: string;
  since?: string;
  files?: string[];
}

export interface GetDiffResult {
  [type: string]: string
}

export async function getDiff(
  { cwd = '.', since, files = [] }: GetDiffOptions = {}
): Promise<GetDiffResult> {
  const args = ["diff", "--name-status", "--relative"];
  if (since) args.push(since);

  log("git", [...args, "--", ...files])
  
  const { stdout } = await exec("git", [...args, "--", ...files], {
    cwd,
  });

  const statusByFile: GetDiffResult = {};
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [status, file] = line.split(/\s+/);
    statusByFile[path.join(cwd, file)] = status;
  }

  return statusByFile;
}
