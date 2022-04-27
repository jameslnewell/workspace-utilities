import fs from "fs/promises";

export type ManifestDependencyKey = "dependencies" | "devDependencies";

export interface ManifestJSON {
  name: string;
  version: string;
  workspaces?: string[] | { packages: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export class Manifest {
  #file: string;
  #json: ManifestJSON;

  constructor(file: string, json: ManifestJSON) {
    this.#file = file;
    this.#json = json;
  }

  get file(): string {
    return this.#file;
  }

  get json(): ManifestJSON {
    return this.#json;
  }

  get name(): string {
    return this.json.name;
  }

  get version(): string {
    return this.json.version;
  }

  get workspaces(): string[] {
    return (
      (Array.isArray(this.json.workspaces)
        ? this.json.workspaces
        : Array.isArray(this.json.workspaces?.packages)
        ? this.json.workspaces?.packages
        : []) ?? []
    );
  }

  dependencies(
    keys: ManifestDependencyKey[] = ["dependencies", "devDependencies"]
  ): Map<string, string> {
    const combined = new Map<string, string>();
    for (const key of keys) {
      const dependencies = this.#json[key];
      if (dependencies) {
        for (const name of Object.keys(dependencies)) {
          const range = dependencies[name];
          if (range) {
            combined.set(name, range);
          }
        }
      }
    }
    return combined;
  }

  script(name: string): string | undefined {
    return this.#json.scripts?.[name];
  }

  static async read(file: string): Promise<Manifest> {
    const contents = await fs.readFile(file);
    const json = JSON.parse(contents.toString());

    if (json === null || typeof json !== "object") {
      throw new Error(`package.json doesn't contain a valid manifest`);
    }
    if (typeof json.name !== "string") {
      throw new Error(`package.json doesn't contain a valid name`);
    }
    if (typeof json.version !== "string") {
      throw new Error(`package.json doesn't contain a valid version`);
    }

    // TODO: check other types match ManifestJSON

    return new Manifest(file, json);
  }
}
