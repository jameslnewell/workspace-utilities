import { exec } from "./exec";

export interface GetDiffOptions {
  root?: string;
  since?: string;
  files?: string[];
}

export async function getDiff({
  root,
  since,
  files = [],
}: GetDiffOptions = {}): Promise<Record<string, string>> {
  const args = ["diff", "--name-status", "--relative"];
  if (since) args.push(since);
  const { stdout } = await exec("git", [...args, "--", ...files], {
    cwd: root,
  });

  const statusByFile: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [status, file] = line.split(/\s+/);
    statusByFile[file] = status;
  }

  return statusByFile;
}
