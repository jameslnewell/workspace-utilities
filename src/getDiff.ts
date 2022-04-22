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
}: GetDiffOptions = {}) {
  const args = ["diff", "--name-status", "--relative"];
  if (since) args.push(since);
  const { stdout } = await exec("git", [...args, "--", ...files], {
    cwd: root,
  });

  const map = new Map<string, string>();
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [status, file] = line.split(/\s+/);
    map.set(file, status);
  }

  return map;
}
