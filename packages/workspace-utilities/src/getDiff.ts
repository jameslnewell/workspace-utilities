import path from "path";
import { exec } from "./exec";

export interface GetDiffOptions {
  since?: string;
  files?: string[];
}

export async function getDiff(
  directory: string,
  { since, files = [] }: GetDiffOptions = {}
): Promise<Record<string, string>> {
  const args = ["diff", "--name-status", "--relative"];
  if (since) args.push(since);
  const { stdout } = await exec("git", [...args, "--", ...files], {
    cwd: directory,
  });

  const statusByFile: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [status, file] = line.split(/\s+/);
    statusByFile[path.join(directory, file)] = status;
  }

  return statusByFile;
}
