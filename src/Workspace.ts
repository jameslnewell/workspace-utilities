import path from "path";
import { Manifest } from "./Manifest";

export class Workspace {
  #manifest: Manifest;

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
  }

  get directory(): string {
    return path.dirname(this.#manifest.file);
  }

  get manifest(): Manifest {
    return this.#manifest;
  }

  get name(): string {
    return this.#manifest.name;
  }

  get version(): string {
    return this.#manifest.version;
  }
}
