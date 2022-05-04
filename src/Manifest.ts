import fs from "fs/promises";
import { DependencyType } from "./DependencyType";

const dependencyKeys = {
  [DependencyType.Dependencies]: "dependencies" as const,
  [DependencyType.DevelopmentDependencies]: "devDependencies" as const,
};

export interface JSON {
  private?: boolean;
  name: string;
  version: string;
  workspaces?: string[] | { packages: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export class Manifest {
  #file: string;
  #json: JSON;

  constructor(file: string, json: JSON) {
    this.#file = file;
    this.#json = json;
  }

  get file(): string {
    return this.#file;
  }

  get json(): JSON {
    return this.#json;
  }

  get private(): boolean {
    return this.#json.private ?? false;
  }

  get name(): string {
    return this.#json.name;
  }

  get version(): string {
    return this.#json.version;
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

  get scripts() {
    return this.#json.scripts ?? {};
  }

  getDependencies(
    types: DependencyType[] = [
      DependencyType.Dependencies,
      DependencyType.DevelopmentDependencies,
    ]
  ): Map<string, string> {
    const combined = new Map<string, string>();
    for (const type of types) {
      const dependencies = this.#json[dependencyKeys[type]];
      if (dependencies) {
        for (const [name, range] of Object.entries(dependencies)) {
          if (range) {
            combined.set(name, range);
          }
        }
      }
    }
    return combined;
  }

  static async fromFile(file: string): Promise<Manifest> {
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

    // TODO: check other types match JSON

    return new Manifest(file, json);
  }
}
