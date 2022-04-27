# @jameslnewell/workspace-utilities

![checks](https://github.com/jameslnewell/workspace-utilities/actions/workflows/checks.yml/badge.svg) ![release](https://github.com/jameslnewell/workspace-utilities/actions/workflows/release.yml/badge.svg)

Utilities for finding and filtering `yarn`/`pnpm`/`npm` workspaces.

## Usage

```ts
import {Project, getDiff} from '@jameslnewell/workspace-utilities'

const directory = process.cwd();
const diff = await getDiff(directory, {since: 'master'});
const project = await Project.fromDirectory(directory);
const workspaces = project.getWorkspaces({
  diff, 
  dependents: 'recursive'
})

workspaces.map(console.log)
```
