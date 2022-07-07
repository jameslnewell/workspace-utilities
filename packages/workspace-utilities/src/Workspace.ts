import path from 'path'
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
  [property: string]: unknown
}

export class Workspace {
  #directory: string;
  #json: JSON;

  public constructor(directory: string, json: JSON) {
    this.#directory = directory;
    this.#json = json;
  }

  public get directory(): string {
    return this.#directory;
  }

  public get json(): JSON {
    return this.#json;
  }

  public get private(): boolean {
    return this.#json.private ?? false;
  }

  public get name(): string {
    return this.#json.name;
  }

  public get version(): string {
    return this.#json.version;
  }

  public get scripts() {
    return this.#json.scripts ?? {};
  }

  dependencies(
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

  static async fromDirectory(directory: string): Promise<Workspace> {
    const contents = await fs.readFile(path.join(directory, 'package.json'));
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

    return new Workspace(directory, json);
  }

}
